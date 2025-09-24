import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { searchParams } = new URL(request.url);
  const personaId = searchParams.get('personaId');

  if (!personaId) {
    return NextResponse.json({ error: 'Missing personaId' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ persona_id: personaId }])
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to create session' }, { status: 500 });
  }

  return NextResponse.json({ sessionId: data.id });
}
