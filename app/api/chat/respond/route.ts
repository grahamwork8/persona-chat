import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { personaId, sessionId, message, history } = await req.json();
    console.log("Received:", { personaId, sessionId, message });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // ✅ Fetch persona prompt
    const { data: persona, error: personaError } = await supabase
      .from("personas")
      .select("prompt")
      .eq("id", personaId)
      .single();

    if (personaError || !persona) {
      console.error("Persona error:", personaError);
      return NextResponse.json({ reply: "", error: "Persona not found" }, { status: 404 });
    }

    // ✅ Use frontend-passed history if available, else fetch from Supabase
    let sessionMessages = history;

    if (!sessionMessages || !Array.isArray(sessionMessages)) {
      const { data: dbHistory, error: historyError } = await supabase
        .from("messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (historyError) {
        console.error("History fetch error:", historyError);
        return NextResponse.json({ reply: "", error: "Failed to load session history" }, { status: 500 });
      }

      sessionMessages = dbHistory || [];
    }

    // ✅ Build full message array with persona prompt
    const messages = [
      { role: "system", content: persona.prompt },
      ...sessionMessages,
      { role: "user", content: message },
    ];

    // ✅ Send to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-5-chat-latest",
      messages,
    });

    const aiReply = response.choices[0]?.message?.content;
    console.log("AI reply:", aiReply);

    // ✅ Store both user and assistant messages
    const { error: insertError } = await supabase.from("messages").insert([
      { session_id: sessionId, role: "user", content: message },
      { session_id: sessionId, role: "assistant", content: aiReply },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error("Unhandled error in POST /respond:", err);
    return NextResponse.json({ reply: "", error: "Internal Server Error" }, { status: 500 });
  }
}

