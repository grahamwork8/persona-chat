// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const filename = file.name || 'upload.pdf';
  const path = `user-${userId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from('persona-files')
    .upload(path, buffer, {
      contentType: file.type || 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  // ✅ Create new persona record
  const { data: persona, error: insertError } = await supabase
    .from('personas')
    .insert([
  {
    owner_id: userId,
    name: filename.replace(/\.[^/.]+$/, ''),
    description: 'Uploaded RAG file',
    model: 'gpt-5-pro-2025-10-06',
    file_id: path,
    prompt: `You are ${filename.replace(/\.[^/.]+$/, '')}, a helpful assistant powered by RAG.`,
  },
])

    .select()
    .single();

  if (insertError) {
    console.error('Persona creation failed:', insertError);
    return NextResponse.json({ error: 'Persona creation failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true, path, personaId: persona.id });
}
