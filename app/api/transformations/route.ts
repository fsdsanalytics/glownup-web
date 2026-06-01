

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      session_id,
      original_image_url,
      glow_up_level = 'lean',
      status = 'pending',
      is_free_generation = true,
    } = body;

    const { data, error } = await supabaseAdmin
      .from('transformations')
      .insert({
        id,
        session_id,
        original_image_url,
        glow_up_level,
        status,
        is_free_generation,
      })
      .select()
      .single();

    if (error) {
      console.error('Transformation insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create transformation' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Transformation route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}