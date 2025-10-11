// lib/persona.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getPersonaById(id: string) {
  const { data, error } = await supabase
    .from('personas')
    .select('*') 
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error("Failed to load persona:", error);
    throw new Error("Persona not found");
  }

  return data;
}

