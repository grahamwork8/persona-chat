import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

const form = formidable({ keepExtensions: true, multiples: true, encoding: 'utf-8' });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'Form parsing failed' });
    }

    const userIdRaw = fields.userId;
    const promptRaw = fields.prompt;
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;
    const prompt = Array.isArray(promptRaw) ? promptRaw[0] : promptRaw;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !userId) {
      return res.status(400).json({ error: 'Missing file or userId' });
    }

    try {
      const rawName = file.originalFilename || 'upload.pdf';
      const safeName = rawName.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const path = `user-${userId}/${safeName}`;
      const fileBuffer = fs.readFileSync(file.filepath);
      const pdfParse = require('pdf-parse');
console.log('typeof pdfParse:', typeof pdfParse);
console.log('pdfParse keys:', Object.keys(pdfParse));





const { error: uploadError } = await supabase.storage
  .from('persona-files')
  .upload(path, fileBuffer, {
    contentType: file.mimetype || 'application/pdf',
    upsert: true,
  });

if (uploadError) {
  console.error('Upload failed:', uploadError);
  return res.status(500).json({ error: 'Upload failed' });
}

const { data: inserted, error: insertError } = await supabase
  .from('personas')
  .insert([
    {
      owner_id: userId,
      name: safeName.replace(/\.[^/.]+$/, ''),
      description: 'Uploaded RAG file',
      model: 'gpt-5-pro-2025-10-06',
      file_id: path,
      prompt: prompt || `You are ${safeName.replace(/\.[^/.]+$/, '')}, a helpful assistant powered by RAG.`,
    },
  ])
  .select();

const persona = inserted?.[0];

if (insertError || !persona) {
  console.error('Persona creation failed:', insertError);
  return res.status(500).json({ error: 'Persona creation failed' });
}

console.log('Inserted persona:', persona);

// ✅ Now you can safely ping using persona.id
const { data: ping, error: pingError } = await supabase
  .from('personas')
  .select()
  .eq('id', persona.id);

console.log('Supabase ping:', ping, pingError);



      if (insertError || !persona) {
        console.error('Persona creation failed:', insertError);
        return res.status(500).json({ error: 'Persona creation failed' });
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('persona-files')
        .download(path);

      if (downloadError || !fileData) {
        console.error('File download failed:', downloadError);
        return res.status(500).json({ error: 'File download failed' });
      }

      // ✅ Parse PDF using pdf-lib
     const buffer = Buffer.from(await fileData.arrayBuffer());
console.log('typeof pdfParse:', typeof pdfParse); // should be 'function'

const parsed = await pdfParse(buffer);
const fullText = parsed.text;


      const chunks = fullText.match(/(.|[\r\n]){1,1000}/g) || [];

      for (const chunk of chunks) {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-large',
          input: chunk,
        });

        const embedding = embeddingResponse.data[0].embedding;

        const { error: docInsertError } = await supabase
          .from('documents')
          .insert([
            {
              owner_id: userId,
              persona_id: persona.id,
              content: chunk,
              embedding,
            },
          ]);

        if (docInsertError) {
          console.error('Chunk insert failed:', docInsertError);
        }
      }

      return res.status(200).json({ success: true, path, Id: persona.id });
    } catch (e) {
      console.error('Unexpected error:', e);
      return res.status(500).json({ error: 'Unexpected server error' });
    }
  });
}
