// app/api/session/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const personaId = req.nextUrl.searchParams.get('personaId');

  const query = supabase
    .from('chat_sessions')
    .select('id, name, persona_id, created_at')
    .order('updated_at', { ascending: false });

  if (personaId) {
    query.eq('persona_id', personaId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Supabase error:', error);
    return NextResponse.json({ sessions: [] }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}
