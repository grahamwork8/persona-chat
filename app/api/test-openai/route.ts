import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET() {
  try {
    const response = await openai.models.list();
    const modelNames = response.data.map((m) => m.id);
    console.log("✅ Available models:", modelNames);
    return NextResponse.json({ models: modelNames });
  } catch (err: any) {
    console.error("❌ OpenAI connection failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
