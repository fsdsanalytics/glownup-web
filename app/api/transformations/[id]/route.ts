import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing transformation id" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("transformations")
    .select(
      "id, original_image_url, generated_image_url, glow_up_level, status, feedback_text, error_message"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Transformation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ transformation: data });
}
