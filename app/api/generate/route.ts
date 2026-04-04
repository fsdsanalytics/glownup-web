import { NextResponse } from "next/server";
import Replicate from "replicate";
import { supabase } from "@/lib/supabase";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const glowUpPromptMap: Record<string, string> = {
    average:
      "Create a realistic version of this same person at roughly 20% body fat with a healthy physique, subtle improvements only, natural lighting, same identity, photorealistic.",
    fit:
      "Create a realistic version of this same person at roughly 16% body fat with an athletic physique, mild muscle definition, natural lighting, same identity, photorealistic.",
    lean:
      "Create a realistic version of this same person at roughly 12% body fat with visible muscle definition, lean athletic build, natural lighting, same identity, photorealistic.",
    shredded:
      "Create a realistic version of this same person at roughly 8 to 10% body fat with strong muscle definition and a very lean athletic physique, natural lighting, same identity, photorealistic.",
  };

export async function POST(req: Request) {
  try {
    const { transformationId } = await req.json();

    if (!transformationId) {
      return NextResponse.json(
        { error: "Missing transformationId" },
        { status: 400 }
      );
    }

    const { data: transformation, error: fetchError } = await supabase
      .from("transformations")
      .select("*")
      .eq("id", transformationId)
      .single();

    if (fetchError || !transformation) {
      return NextResponse.json(
        { error: "Transformation not found" },
        { status: 404 }
      );
    }

    const prompt =
      glowUpPromptMap[transformation.glow_up_level] ??
      glowUpPromptMap.lean;

    // You may swap this model later after testing.
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `${prompt} Use the uploaded image as the subject reference.`,
          input_image: transformation.original_image_url,
          aspect_ratio: "1:1",
          output_format: "jpg",
          output_quality: 90,
        },
      }
    );

    let generatedImageUrl = "";

    if (Array.isArray(output) && output.length > 0) {
      generatedImageUrl = String(output[0]);
    } else if (typeof output === "string") {
      generatedImageUrl = output;
    } else {
      throw new Error("No generated image returned from Replicate");
    }

    // download generated image and re-store in Supabase
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
      .eq("id", transformationId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      generatedImageUrl: finalGeneratedUrl,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}