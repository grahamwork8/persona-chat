//api/session/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { sessionId, name } = await req.json();

  if (!sessionId || !name) {
    return NextResponse.json({ error: 'Missing sessionId or name' }, { status: 400 });
  }

  // ✅ Check if session has any user messages
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('id')
    .eq('session_id', sessionId)
    .eq('role', 'user')
    .limit(1);

  if (msgError || !messages || messages.length === 0) {
    return NextResponse.json({ error: 'Cannot rename empty session' }, { status: 400 });
  }

  const { error } = await supabase
    .from('chat_sessions')
    .update({ name })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to rename session:', error);
    return NextResponse.json({ error: 'Failed to rename session' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
