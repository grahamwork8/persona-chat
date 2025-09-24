// app/api/session/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    console.log("🆕 Creating new chat session");

    const { userId } = getAuth(req);
    console.log("🔐 Authenticated user:", userId);

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const body = await req.json();
    const { personaId } = body;

    if (!personaId) {
      return NextResponse.json({ error: "Missing personaId" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("chat_sessions")
      .insert({ user_id: userId, persona_id: personaId })
      .select("id")
      .single();

    if (error || !data) {
      console.error("❌ Session creation error:", error);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    console.log("✅ Created session:", data.id);
    return NextResponse.json({ sessionId: data.id });
  } catch (error) {
    console.error("🔥 Session API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "Session API is alive 🧬" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
