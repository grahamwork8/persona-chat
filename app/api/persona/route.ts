import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const personaId = req.nextUrl.searchParams.get("personaId");

  const { data, error } = await supabaseServer
    .from("personas")
    .select("*")
    .eq("id", personaId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
