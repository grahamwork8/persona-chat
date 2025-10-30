// app/api/session/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  console.log('Cleanup route called');

  const body = await req.text();
  console.log('Payload received:', body);

  let sessionId;
  try {
    ({ sessionId } = JSON.parse(body));
  } catch (err) {
    console.error('Failed to parse cleanup payload:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  console.log('Checking for user messages in session:', sessionId);

  const { data: userMessages, error: msgError } = await supabase
    .from('messages')
    .select('id')
    .eq('session_id', sessionId)
    .eq('role', 'user')
    .limit(1);

  if (msgError) {
    console.error('Error checking messages:', msgError);
    return NextResponse.json({ error: 'Failed to check messages' }, { status: 500 });
  }

  console.log('User messages found:', userMessages?.length);

  if (!userMessages || userMessages.length === 0) {
    console.log('Deleting session:', sessionId);
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (deleteError) {
      console.error('Failed to delete session:', deleteError);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  }

  return NextResponse.json({ deleted: false });
}

