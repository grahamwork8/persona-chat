// /pages/api/chat/new.ts
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { personaId } = req.query;

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ persona_id: personaId }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.status(200).json({ sessionId: data.id });
}
