// app/api/generation-limit/route.ts

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

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count, error } = await supabaseAdmin
      .from("transformations")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("session_id", sessionId)
      .gte("created_at", startOfToday.toISOString());

    if (error) {
      throw error;
    }

    const generationsToday = count || 0;

    if (generationsToday >= 3) {
      return NextResponse.json(
        {
          allowed: false,
          message: "Free generation limit reached for today.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      allowed: true,
      remaining: 3 - generationsToday,
    });
  } catch (error) {
    console.error("Generation limit check failed:", error);

    return NextResponse.json(
      { error: "Failed to check generation limit" },
      { status: 500 }
    );
  }
}