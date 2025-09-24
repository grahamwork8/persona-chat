// app/api/personas/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ personas: [] });

  const { data, error } = await supabaseServer
    .from("personas")
    .select("id, name, description");

  if (error) {
    console.error("❌ Failed to fetch personas:", error);
    return NextResponse.json({ personas: [] });
  }

  return NextResponse.json({ personas: data });
}
