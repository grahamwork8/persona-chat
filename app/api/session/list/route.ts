//api/session/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, name, persona_id, created_at')
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.error('Supabase error:', error);
      return NextResponse.json({ sessions: [] }, { status: 500 });
    }

    return NextResponse.json({ sessions: data });
  } catch (err) {
    console.error('Unhandled error in /api/session/list:', err);
    return NextResponse.json({ sessions: [] }, { status: 500 });
  }
}
