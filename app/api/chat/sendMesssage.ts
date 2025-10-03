import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { getPersonaById } from "@/app/api/persona/route.ts";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function saveMessage(sessionId: string, role: "user" | "persona", content: string) {
  const { error } = await supabase
    .from("messages")
    .insert([{ session_id: sessionId, role, content }]);

  if (error) {
    console.error(`Failed to save ${role} message:`, error);
    throw new Error("Database insert failed");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, personaId, sessionId } = await req.json();

    if (!message || !personaId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const persona = await getPersonaById(personaId);

    const systemPrompt = `You are ${persona.name}, a ${persona.bio}. Respond with their tone and expertise.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({ error: "No reply generated" }, { status: 500 });
    }

    await saveMessage(sessionId, "user", message);
    await saveMessage(sessionId, "persona", reply);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("sendMessage error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

