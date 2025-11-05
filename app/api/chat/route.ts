import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { getPersonaById } from "@/lib/persona";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type RagMatch = { content: string };

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const { personaId, sessionId, message, history } = await req.json();
    console.log("Received:", { personaId, sessionId, message });

    const persona = await getPersonaById(personaId);

    const embeddedQuery = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: message,
    });

    const queryEmbedding = embeddedQuery.data[0].embedding;

    const { data: ragMatches, error: matchError } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      target_persona_id: personaId,
    });

    if (matchError) {
      console.error("RAG match error:", matchError);
    }

    const ragContext = ragMatches?.length
      ? (ragMatches as RagMatch[]).map((m) => m.content).join("\n\n")
      : message.toLowerCase().includes("who are you")
        ? `J.D. O’Hara is the CEO of Internova Travel Group...`
        : "";

    console.log("🔍 Retrieved RAG context:", ragContext.slice(0, 300));

    const systemPrompt = `${persona.prompt?.trim() || `You are ${persona.name}, a helpful assistant powered by RAG.`}\n\nContext:\n${ragContext}`;

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

    const messages = [
      { role: "system", content: systemPrompt },
      ...sessionMessages,
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5-chat-latest",
      messages,
    });

    const aiReply = response.choices[0]?.message?.content?.trim();
    console.log("AI reply:", aiReply);

    const isEcho = aiReply === persona.prompt?.trim();

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
    console.error("Unhandled error in POST /chat:", err);
    return NextResponse.json({ reply: "", error: "Internal Server Error" }, { status: 500 });
  }
}
