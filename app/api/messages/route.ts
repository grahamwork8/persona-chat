import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    return NextResponse.json({ messages: [] }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    console.warn("Missing sessionId in query");
    return NextResponse.json({ messages: [] }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}
