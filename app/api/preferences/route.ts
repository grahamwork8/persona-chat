import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ personaId: null });

  const { data, error } = await supabaseServer
    .from("user_preferences")
    .select("default_persona_id")
    .eq("user_id", userId)
    .single();

  if (error || !data) return NextResponse.json({ personaId: null });
  return NextResponse.json({ personaId: data.default_persona_id });
}

export async function POST(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { personaId } = await req.json();
  if (!personaId) return NextResponse.json({ error: "Missing personaId" }, { status: 400 });

  const { error } = await supabaseServer
    .from("user_preferences")
    .upsert({ user_id: userId, default_persona_id: personaId });

  if (error) return NextResponse.json({ error: "Failed to save preference" }, { status: 500 });
  return NextResponse.json({ success: true });
}
