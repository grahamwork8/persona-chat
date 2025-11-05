'use client';

import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import SessionManager from './SessionManager';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
};

export default function ChatInput({
  personaId,
  sessionId,
}: {
  personaId: string;
  sessionId?: string;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [persona, setPersona] = useState<{ name: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserMessage, setHasUserMessage] = useState(false);

  useEffect(() => {
    if (personaId && sessionId) {
      fetchPersona();
      fetchMessages();
    }
  }, [personaId, sessionId]);

useEffect(() => {
  const handleUnload = () => {
    if (!hasUserMessage && sessionId) {
      const payload = JSON.stringify({ sessionId });
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/session/cleanup', blob);
    }
  };

  window.addEventListener('beforeunload', handleUnload);
  return () => window.removeEventListener('beforeunload', handleUnload);
}, [hasUserMessage, sessionId]);

  const fetchPersona = async () => {
    try {
      const res = await fetch(`/api/persona?personaId=${personaId}`, { credentials: 'include' });
      const data = await res.json();
      setPersona(data.persona);
    } catch (err) {
      console.error('Failed to fetch persona:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?sessionId=${sessionId}`, { credentials: 'include' });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setHasUserMessage(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message,
          personaId,
          sessionId,
          history: messages,
        }),
      });

      if (!res.ok) {
        console.error('Server error:', res.status);
        return;
      }

      const data = await res.json();
      if (!data || typeof data.reply !== 'string') {
        console.error('Invalid response format:', data);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.reply },
      ]);

      setMessage('');
    } catch (err) {
      console.error('sendMessage error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {persona && (
        <div className="p-3 bg-gray-50 border rounded">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Chatting with <strong>{persona.name}</strong>
              </p>
              <p className="text-xs text-gray-500 italic">{persona.description}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
          <span className="ml-2 text-sm text-gray-500">Thinking...</span>
        </div>
      )}

      <MessageList messages={messages} />

      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Type your message..."
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={sendMessage}
        disabled={!message.trim() || isLoading}
      >
        Send
      </button>
    </div>
  );
}
