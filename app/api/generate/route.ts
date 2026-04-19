import { NextResponse } from "next/server";
import Replicate from "replicate";
import { supabase } from "@/lib/supabase";
import { track } from "@vercel/analytics/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const glowUpPromptMap: Record<string, string> = {
  average:
    "Edit this exact same person in the uploaded photo. Keep the same face, identity, hair, skin tone, pose, framing, background, and overall composition. Make only subtle physique improvements so the person looks healthy and slightly more in shape, roughly around 20% body fat. Keep the result photorealistic and natural.",
  fit:
    "Edit this exact same person in the uploaded photo. Keep the same face, identity, hair, skin tone, pose, framing, background, and overall composition. Reduce body fat modestly and add mild athletic muscle definition so the person looks fit, roughly around 16% body fat. Keep the result photorealistic and natural.",
  lean:
    "Edit this same person in the uploaded photo. Preserve the same face, identity, hairstyle, skin tone, pose, camera angle, framing, and overall scene. Make a clearly visible but realistic lean transformation: reduce body fat, flatten the stomach, narrow the waist slightly, and add natural athletic definition to the chest, shoulders, arms, and upper abs. The result should still look like the same real person, not a different model or bodybuilder. Maintain photorealism, natural skin texture, and similar lighting.",
  shredded:
    "Edit this exact same person in the uploaded photo. Keep the same face, identity, hair, skin tone, pose, framing, background, and overall composition. Make the physique very lean with strong but realistic muscle definition so the person looks shredded, roughly around 8 to 10% body fat. Keep the result photorealistic and natural.",
};

export async function POST(req: Request) {
  let currentTransformationId: string | undefined;

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

    const { data: transformation, error: fetchError } = await supabase
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

    const { error: generatingError } = await supabase
      .from("transformations")
      .update({ status: "generating", error_message: null })
      .eq("id", currentTransformationId);

    if (generatingError) {
      throw generatingError;
    }

    const prompt =
      glowUpPromptMap[transformation.glow_up_level] ?? glowUpPromptMap.lean;

    const output = await replicate.run(
      "black-forest-labs/flux-kontext-max",
      {
        input: {
          prompt,
          input_image: transformation.original_image_url,
          aspect_ratio: "match_input_image",
          output_format: "jpg",
          output_quality: 90,
          guidance: 2.5,
          num_inference_steps: 30,
        },
      }
    );

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

    const { error: uploadError } = await supabase.storage
      .from("generated-outputs")
      .upload(fileName, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("generated-outputs")
      .getPublicUrl(fileName);

    const finalGeneratedUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
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
      await supabase
        .from("transformations")
        .update({ status: "failed", error_message: message })
        .eq("id", currentTransformationId);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}