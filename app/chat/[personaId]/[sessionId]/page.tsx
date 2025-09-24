'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ChatInput from '@/components/ChatInput';
import PersonaSelector from '@/components/PersonaSelector';
import dayjs from 'dayjs';

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
        .eq('chat_session_id', sessionId)
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
            filter: `chat_session_id=eq.${sessionId}`,
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
    <main className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold">{persona.name}</h1>
        <p className="text-sm text-gray-600">{persona.description}</p>
      </div>

      <div className="space-y-4 mb-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 text-right text-gray-500">
                  {dayjs(msg.created_at).format('HH:mm')}
                </p>
              </div>
            </div>
          );
        })}

<button
  onClick={startNewChat}
  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  New Chat
</button>
      </div>

      <ChatInput personaId={personaId as string} sessionId={sessionId as string} />
    </main>
  );
}

