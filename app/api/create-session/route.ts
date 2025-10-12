import { createClient } from '@/lib/supabaseClient';
const supabase = createClient();


export async function POST(req: Request) {
  const { userId, personaId } = await req.json();

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ user_id: userId, persona_id: personaId }])
    .select();

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify(data[0]), { status: 200 });
}
