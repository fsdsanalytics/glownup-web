import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { transformationId, feedback } = await request.json();

    if (!transformationId || typeof transformationId !== "string") {
      return NextResponse.json(
        { error: "Missing transformation id" },
        { status: 400 }
      );
    }

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json(
        { error: "Missing feedback" },
        { status: 400 }
      );
    }

    const cleanedFeedback = feedback.trim().slice(0, 2000);

    const { error } = await supabaseAdmin
      .from("transformations")
      .update({ feedback_text: cleanedFeedback })
      .eq("id", transformationId);

    if (error) {
      return NextResponse.json(
        { error: "Could not save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, feedback_text: cleanedFeedback });
  } catch (error) {
    console.error("Feedback API error:", error);

    return NextResponse.json(
      { error: "Unexpected feedback error" },
      { status: 500 }
    );
  }
}
