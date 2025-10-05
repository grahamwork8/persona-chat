import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  const { data, error } = await supabase.storage
    .from("rag-files")
    .upload(`user-${userId}/${file.name}`, file, {
      cacheControl: "3600",
      upsert: true
    });

  if (error) return new Response("Upload failed", { status: 500 });
  return new Response(JSON.stringify({ path: data.path }), {
    headers: { "Content-Type": "application/json" }
  });
}
