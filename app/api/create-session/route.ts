import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}



export async function POST(req: Request) {
  const { userId, personaId } = await req.json();

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ user_id: userId, persona_id: personaId }])
    .select();

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify(data[0]), { status: 200 });
}
