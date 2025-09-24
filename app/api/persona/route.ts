// app/api/persona/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const personaId = searchParams.get("personaId");

  const { userId } = getAuth(req);
  if (!userId || !personaId) {
    return NextResponse.json({ persona: null });
  }

  const { data, error } = await supabaseServer
    .from("personas")
    .select("name, description")
    .eq("id", personaId)
    .single();

  if (error || !data) {
    console.error("❌ Persona fetch error:", error);
    return NextResponse.json({ persona: null });
  }

  return NextResponse.json({ persona: data });
}
