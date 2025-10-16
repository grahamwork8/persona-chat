//respond/route.ts
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

    // ✅ Check if system message already exists in Supabase
    const { data: existingSystemMessages, error: systemCheckError } = await supabase
      .from("messages")
      .select("id")
      .eq("session_id", sessionId)
      .eq("role", "system")
      .limit(1);

    if (systemCheckError) {
      console.error("System message check error:", systemCheckError);
      return NextResponse.json({ reply: "", error: "Failed to check system message" }, { status: 500 });
    }

    // ✅ Insert system message if not already present
    if (!existingSystemMessages || existingSystemMessages.length === 0) {
      const { error: systemInsertError } = await supabase.from("messages").insert([
        {
          session_id: sessionId,
          role: "system",
          content: persona.prompt,
        },
      ]);

      if (systemInsertError) {
        console.error("System message insert error:", systemInsertError);
      }
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

// ✅ Build final message array for OpenAI
const hasSystemPrompt = history.some(
  (msg: { role: string; content: string }) =>
    msg.role === "system" && msg.content?.trim() === persona.prompt?.trim()
);

const messages = [
  ...(hasSystemPrompt ? [] : [{ role: "system", content: persona.prompt }]),
  ...history,
  { role: "user", content: message },
];



console.log("Final messages sent to OpenAI:", JSON.stringify(messages, null, 2));

    // ✅ Send to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-5-chat-latest",
      messages,
    });

    const aiReply = response.choices[0]?.message?.content?.trim();
    console.log("AI reply:", aiReply);

    // ✅ Detect and suppress echo replies
    const isEcho = aiReply === persona.prompt?.trim();

    // ✅ Store user message, and assistant reply only if not echo
    const messagesToInsert = [
      { session_id: sessionId, role: "user", content: message },
    ];

    if (!isEcho) {
      messagesToInsert.push({
        session_id: sessionId,
        role: "assistant",
        content: aiReply,
      });
    }

    const { error: insertError } = await supabase.from("messages").insert(messagesToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error("Unhandled error in POST /respond:", err);
    return NextResponse.json({ reply: "", error: "Internal Server Error" }, { status: 500 });
  }
}

