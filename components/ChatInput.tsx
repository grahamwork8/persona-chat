import { useState, useEffect } from "react";
import MessageList from "./MessageList";

export default function ChatInput({
  personaId,
  sessionId,
}: {
  personaId: string;
  sessionId?: string;
}) {
const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [persona, setPersona] = useState<{ name: string; description: string } | null>(null);
  type Message = {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
};

const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchPersona();
  }, [personaId, sessionId]);

  const fetchPersona = async () => {
    const res = await fetch(`/api/persona?personaId=${personaId}`, {
      credentials: "include",
    });
    const data = await res.json();
    setPersona(data.persona);
  };

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages?sessionId=${sessionId}`, {
      credentials: "include",
    });
    const data = await res.json();
    setMessages(data.messages);
  };
const sendMessage = async () => {
  if (!message.trim()) return;

  setIsLoading(true);

  try {
    const res = await fetch("/api/chat/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message, personaId, sessionId }),
    });

    if (!res.ok) {
      console.error("Server error:", res.status);
      setIsLoading(false);
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      setIsLoading(false);
      return;
    }

console.log("Response from backend:", data);

if (!data || typeof data.reply !== "string") {
  console.error("Invalid response format:", data);
  return;
}

setReply(data.reply);
setMessage("");
fetchMessages();
  } catch (err) {
    console.error("sendMessage error:", err);
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
          if (e.key === "Enter" && !e.shiftKey) {
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
