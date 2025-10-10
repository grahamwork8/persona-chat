import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { personaId, sessionId, message } = await req.json();
    console.log("Received:", { personaId, sessionId, message });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const { data: persona, error: personaError } = await supabase
      .from("personas")
      .select("prompt")
      .eq("id", personaId)
      .single();

    if (personaError || !persona) {
      console.error("Persona error:", personaError);
      return NextResponse.json({ reply: "", error: "Persona not found" }, { status: 404 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5-chat-latest",
      messages: [
        { role: "system", content: persona.prompt },
        { role: "user", content: message },
      ],
    });

    const aiReply = response.choices[0]?.message?.content;
    console.log("AI reply:", aiReply);


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

