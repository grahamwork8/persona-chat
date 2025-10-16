//api/session/save/route.ts
  import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { sessionId, name } = await req.json();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


  const { error } = await supabase
    .from("chat_sessions")
    .update({ name })
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: "Failed to save session name" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
