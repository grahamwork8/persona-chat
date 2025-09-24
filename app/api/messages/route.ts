// app/api/messages/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  const { userId } = getAuth(req);
  if (!userId || !sessionId) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await supabaseServer
    .from("messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Message fetch error:", error);
    return NextResponse.json({ messages: [] });
  }

  return NextResponse.json({ messages: data });
}
