import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";
import { getGlowUpPrompt } from "@/lib/prompts/glow-up-prompts";
import { track } from "@vercel/analytics/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  let currentTransformationId: string | undefined;
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || null;

  try {
    const { transformationId } = await req.json();
    currentTransformationId =
      typeof transformationId === "string" ? transformationId : undefined;

    if (!currentTransformationId) {
      return NextResponse.json(
        { error: "Missing transformationId" },
        { status: 400 }
      );
    }

    const { data: transformation, error: fetchError } = await supabaseAdmin
      .from("transformations")
      .select("*")
      .eq("id", currentTransformationId)
      .single();

    if (fetchError || !transformation) {
      return NextResponse.json(
        { error: "Transformation not found" },
        { status: 404 }
      );
    }

    if (transformation.status === "completed") {
      return NextResponse.json({ message: "Already generated" });
    }

    if (transformation.status === "generating") {
      return NextResponse.json({ message: "Already generating" });
    }

    const { count: dailyGenerationCount, error: countError } = await supabaseAdmin
      .from("transformations")
      .select("*", { count: "exact", head: true })
      .eq("session_id", transformation.session_id);

    if (countError) {
      throw countError;
    }

    if ((dailyGenerationCount || 0) > 3) {
      await supabaseAdmin
        .from("transformations")
        .update({
          status: "failed",
          error_message: "Free generation limit reached for today.",
        })
        .eq("id", currentTransformationId);

      return NextResponse.json(
        { error: "Free generation limit reached for today." },
        { status: 429 }
      );
    }

    const { error: generatingError } = await supabaseAdmin
      .from("transformations")
      .update({
        status: "generating",
        error_message: null,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .eq("id", currentTransformationId);

    if (generatingError) {
      throw generatingError;
    }

    const prompt = getGlowUpPrompt(transformation.glow_up_level);

    let output;

    try {
      output = await replicate.run(
        "openai/gpt-image-2",
        {
          input: {
            prompt,
            input_images: [transformation.original_image_url],
            aspect_ratio: "2:3",
            quality: "medium",
            number_of_images: 1,
            output_format: "jpeg",
            background: "opaque",
            moderation: "low",
          },
        }
      );
    } catch (primaryError) {
      console.warn("GPT Image 2 generation failed. Falling back to Flux Kontext Max:", primaryError);

      await supabaseAdmin
        .from("transformations")
        .update({
          status: "retrying",
          error_message: "Primary generation failed. Retrying with fallback model.",
        })
        .eq("id", currentTransformationId);

      output = await replicate.run(
        "black-forest-labs/flux-kontext-max",
        {
          input: {
            prompt,
            input_image: transformation.original_image_url,
            output_format: "jpg",
            aspect_ratio: "match_input_image",
            output_quality: 90,
            guidance: 2.5,
            num_inference_steps: 30,
          },
        }
      );
    }

    let generatedImageUrl = "";

    if (typeof output === "string") {
      generatedImageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      const first = output[0] as unknown;
    
      if (typeof first === "string") {
        generatedImageUrl = first;
      } else if (
        typeof first === "object" &&
        first !== null &&
        "url" in first &&
        typeof (first as { url?: unknown }).url === "function"
      ) {
        generatedImageUrl = String(await (first as { url: () => Promise<string> }).url());
      } else {
        generatedImageUrl = String(first);
      }
    } else if (
      typeof output === "object" &&
      output !== null &&
      "url" in output &&
      typeof (output as { url?: unknown }).url === "function"
    ) {
      generatedImageUrl = String(await (output as { url: () => Promise<string> }).url());
    } else {
      console.error("Unexpected Replicate output:", output);
      throw new Error("No generated image returned from Replicate");
    }

    const imageResponse = await fetch(generatedImageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch generated image");
    }

    const imageBlob = await imageResponse.blob();
    const fileName = `${transformation.session_id}/${transformation.id}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("generated-outputs")
      .upload(fileName, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("generated-outputs")
      .getPublicUrl(fileName);

    const finalGeneratedUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabaseAdmin
      .from("transformations")
      .update({
        generated_image_url: finalGeneratedUrl,
        status: "completed",
        error_message: null,
      })
      .eq("id", currentTransformationId);

    if (updateError) {
      throw updateError;
    }

    track("generation_completed", {
      glowUpLevel: transformation.glow_up_level,
      transformationId: currentTransformationId,
    });

    return NextResponse.json({
      success: true,
      generatedImageUrl: finalGeneratedUrl,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (currentTransformationId) {
      await supabaseAdmin
        .from("transformations")
        .update({ status: "failed", error_message: message })
        .eq("id", currentTransformationId);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}