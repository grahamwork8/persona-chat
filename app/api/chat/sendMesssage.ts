import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { message, personaId, sessionId } = await req.json();

  // Fetch persona from Supabase
  const persona = await getPersonaById(personaId); // your Supabase query

  const systemPrompt = `You are ${persona.name}, a ${persona.bio}. Respond with their tone and expertise.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]
  });

  const reply = response.choices[0].message.content;

  // Save message to Supabase
  await saveMessage(sessionId, 'user', message);
  await saveMessage(sessionId, 'persona', reply);

  return NextResponse.json({ reply });
}
