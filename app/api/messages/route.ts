// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      console.warn('Missing sessionId in query');
      return NextResponse.json({ messages: [] }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ messages: [] }, { status: 500 });
    }

    return NextResponse.json({ messages: data });
  } catch (err) {
    console.error('Unhandled error in GET /api/messages:', err);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

