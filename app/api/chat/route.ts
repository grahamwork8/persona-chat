import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  console.log("🔧 Starting /api/chat");

  const auth = getAuth(req);
  const userId = auth?.userId;
  console.log("🔐 Authenticated user:", userId);

    if (!userId) {
      console.warn("⚠️ No userId found, redirecting to sign-in");
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const body = await req.json();
    console.log("📦 Request body:", body);

    const { message, personaId, sessionId } = body;

    if (!message || !personaId || !sessionId) {
      console.warn("⚠️ Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("🧠 Fetching persona prompt...");
    const { data: personaData, error: personaError } = await supabaseServer
      .from("personas")
      .select("prompt")
      .eq("id", personaId)
      .single();

    if (personaError || !personaData?.prompt) {
      console.error("❌ Persona fetch error:", personaError);
      return NextResponse.json({ error: "Persona prompt not found" }, { status: 404 });
    }

    const systemPrompt = personaData.prompt;
    console.log("🧾 System prompt:", systemPrompt);

    console.log("📚 Fetching message history...");
    const { data: messagesData, error: messagesError } = await supabaseServer
      .from("messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("❌ Message fetch error:", messagesError);
    }

    const chatHistory = [
      { role: "system", content: systemPrompt },
      ...(messagesData ?? []),
      { role: "user", content: message }
    ];

    console.log("🧠 Sending to OpenAI:", chatHistory);

    const openaiResponse = await openai.chat.completions.create({
  model: "gpt-4",
  messages: chatHistory
});

const reply = openaiResponse.choices[0]?.message?.content ?? "No response";

    console.log("🤖 OpenAI reply:", reply);
console.log("Inserting messages:", [
  { session_id: sessionId, role: "user", content: message },
  { session_id: sessionId, role: "ai", content: aiReply },
]);


    console.log("💾 Saving messages to Supabase...");
    await supabaseServer.from("messages").insert([
      { session_id: sessionId, role: "user", content: message },
      { session_id: sessionId, role: "assistant", content: reply }
    ]);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("🔥 API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "Chat API is alive 🚀" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}





