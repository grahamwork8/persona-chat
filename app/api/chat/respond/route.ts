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
      .select("prompt, name")
      .eq("id", personaId)
      .single();

    if (personaError || !persona) {
      console.error("Persona error:", personaError);
      return NextResponse.json({ reply: "", error: "Persona not found" }, { status: 404 });
    }

    // ✅ Embed user message
    const embeddedQuery = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: message,
    });

    const queryEmbedding = embeddedQuery.data[0].embedding;

    // ✅ Retrieve relevant chunks from Supabase
    const { data: matches, error: matchError } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.8,
      match_count: 5,
      target_persona_id: personaId,
    });

    if (matchError) {
      console.error("RAG match error:", matchError);
    }

    const context = matches?.map((m: { content: string }) => m.content).join("\n\n") || "";
    console.log("🔍 Retrieved context:", context);
	const partial = [
  0.0009262376697733998, -0.03403880447149277, 0.00846845842897892,
  0.00021115297568030655, -0.006626293994486332, -0.0047910031862556934,
  -0.005478377919644117, -0.01613956317305565, -0.0167994424700737,
  0.0396752804517746, -0.051938049495220184, 0.007561123929917812,
  -0.010716174729168415, 0.044404421001672745, -0.02291707880795002,
  -0.01038623508065939, -0.024291830137372017, -0.02011258900165558,
  0.007021534722298384, -0.013307577930390835
];

const padded = [...partial, ...Array(3072 - partial.length).fill(0)];
console.log(`[${padded.join(',')}]`);



    // ✅ Build unified system prompt
    const systemPrompt = `${persona.prompt?.trim() || `You are ${persona.name}, a helpful assistant powered by RAG.`}

Context:
${context}`;

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

    // ✅ Always inject system prompt fresh
    const messages = [
      { role: "system", content: systemPrompt },
      ...sessionMessages,
      { role: "user", content: message },
    ];

    console.log("🧠 Final system prompt:", systemPrompt);
    console.log("📨 Final messages sent to OpenAI:", JSON.stringify(messages, null, 2));

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
    console.error("Unhandled error in POST /respond:", err);
    return NextResponse.json({ reply: "", error: "Internal Server Error" }, { status: 500 });
  }
}
