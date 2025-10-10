'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ChatInput from '@/components/ChatInput';
import PersonaSelector from '@/components/PersonaSelector';
import dayjs from 'dayjs';
import MessageList from '@/components/MessageList';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatPage() {
  const { personaId, sessionId } = useParams();
  const router = useRouter();

  const [persona, setPersona] = useState<any>(null);
  const [sessionValid, setSessionValid] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChat = async () => {
      if (!personaId || !sessionId) return;

      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('persona_id', personaId)
        .single();

      if (sessionError || !sessionData) {
        setSessionValid(false);
        setLoading(false);
        return;
      }

      setSessionValid(true);

      const { data: personaData } = await supabase
        .from('personas')
        .select('*')
        .eq('id', personaId)
        .single();

      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      setPersona(personaData);
      setMessages(messageData || []);
      setLoading(false);

      const channel = supabase
        .channel('chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    loadChat();
  }, [personaId, sessionId]);

  const startNewChat = async () => {
    const res = await fetch(`/api/chat/new?personaId=${personaId}`, {
      method: 'POST',
    });
    const { sessionId: newSessionId } = await res.json();
    router.push(`/chat/${personaId}/${newSessionId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-500">Loading your chat...</span>
      </div>
    );
  }

  if (!sessionValid || !persona) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <PersonaSelector onSelect={(id) => router.push(`/chat/${id}/new`)} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="bg-white border rounded p-4 shadow flex justify-between items-center">
  <div>
    <h1 className="text-lg font-semibold">{persona.name}</h1>
    <p className="text-sm text-gray-500 italic">{persona.description}</p>
    <p className="text-xs text-gray-400 italic">
      Model: {persona.model || 'gpt-5-chat-latest'}
    </p>
  </div>
  <button
    onClick={startNewChat}
    className="px-15 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-900"
  >
    New Chat
  </button>
</div>


        

        {/* Chat Input */}
        <ChatInput personaId={personaId as string} sessionId={sessionId as string} />
      </div>
    </main>
  );
}
