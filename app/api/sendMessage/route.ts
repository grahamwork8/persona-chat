import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getPersonaById } from '@/lib/persona';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function saveMessage(sessionId: string, role: 'user' | 'persona', content: string) {
  const { error } = await supabase
    .from('messages')
    .insert([{ session_id: sessionId, role, content }]);

  if (error) {
    console.error(`❌ Failed to save ${role} message:`, error);
    throw new Error('Database insert failed');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, personaId, sessionId } = await req.json();

    if (!message || !personaId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const persona = await getPersonaById(personaId);
    console.log('🧠 Loaded persona:', persona);

    const model = persona.model?.startsWith('gpt-') ? persona.model : 'gpt-5-chat-latest';
    console.log(`🔍 Using OpenAI model: ${model}`);

    let systemPrompt: string;

    if (persona.file_id) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('persona-files')
        .download(persona.file_id);

      if (fileError || !fileData) {
        console.warn('⚠️ Failed to load RAG file:', fileError);
        systemPrompt = persona.prompt ?? `You are ${persona.name}, a helpful assistant.`;
      } else {
        const text = await fileData.text();
        const trimmed = text.slice(0, 4000); // Optional: limit context size
        systemPrompt = `You are ${persona.name}, a helpful assistant. Use the following context:\n\n${trimmed}`;
      }
    } else {
      systemPrompt = persona.prompt ?? `You are ${persona.name}, a helpful assistant.`;
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({ error: 'No reply generated' }, { status: 500 });
    }

    await saveMessage(sessionId, 'user', message);
    await saveMessage(sessionId, 'persona', reply);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('sendMessage error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
