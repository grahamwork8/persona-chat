// lib/rag.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function getRagContext(userMessage: string, personaId: string) {
  try {
    console.log('🔍 Embedding user query...');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: userMessage,
    });


    console.log('📡 Calling match_documents RPC...');
    const queryEmbedding = embeddingResponse.data[0].embedding;

const { data: matches, error: matchError } = await supabase.rpc("match_documents", {
  query_embedding: queryEmbedding,
  match_threshold: 0.5,
  match_count: 5,
  target_persona_id: personaId,
});

    if (matchError) {
      console.error('❌ match_documents RPC error:', matchError);
      return '';
    }

    if (!matches || matches.length === 0) {
      console.warn('⚠️ No RAG matches found for persona:', personaId);
      return '';
    }

    type RagMatch = { content: string };

const contextChunks = (matches as RagMatch[]).map((m) => m.content);

    const context = contextChunks.join('\n\n');

    console.log(`✅ Injecting ${contextChunks.length} RAG chunks`);
    console.log('🧩 First chunk preview:', contextChunks[0]?.slice(0, 300));

    return context;
  } catch (e) {
    console.error('🔥 RAG retrieval failed:', e);
    return '';
  }
}
