import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const personaId = formData.get("personaId"); // or from req.url

const { data, error } = await supabase.storage
  .from("persona-files")
  .upload(`user-${userId}/${file.name}`, file, {
    cacheControl: "3600",
    upsert: true
  });

if (error) {
  console.error("❌ Supabase upload error:", error);
  return new Response("Upload failed", { status: 500 });
}

// ✅ Link file to persona
await supabase
  .from("personas")
  .update({ file_id: data.path })
  .eq("id", personaId);

return new Response(JSON.stringify({ path: data.path }), {
  headers: { "Content-Type": "application/json" }
});
}