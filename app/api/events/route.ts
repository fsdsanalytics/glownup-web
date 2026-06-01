

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      event_name,
      session_id,
      transformation_id,
      page_path,
      metadata,
    } = await req.json();

    const { error } = await supabaseAdmin
      .from('events')
      .insert({
        event_name,
        session_id,
        transformation_id,
        page_path,
        metadata,
      });

    if (error) {
      console.error('Event insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Events route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}