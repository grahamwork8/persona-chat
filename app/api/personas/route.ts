// app/api/personas/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("personas")
    .select("id, name, description");

  if (error) {
    console.error("❌ Supabase error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch personas." }), {
      status: 500
    });
  }

  return new Response(JSON.stringify({ personas: data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
