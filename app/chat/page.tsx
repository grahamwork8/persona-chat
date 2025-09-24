"use client";

import { useEffect, useState } from "react";
import ChatInput from "@/components/ChatInput";
import PersonaSelector from "@/components/PersonaSelector";

export default function ChatPage() {
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefaultPersona = async () => {
      try {
        const res = await fetch("/api/preferences", { credentials: "include" });
        const data = await res.json();

        if (data.personaId) {
          setPersonaId(data.personaId);
        } else {
          console.warn("No default persona found");
        }
      } catch (err) {
        console.error("Failed to fetch default persona:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultPersona();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-500">Loading your persona...</span>
      </div>
    );
  }

  if (!personaId) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <PersonaSelector onSelect={(id) => setPersonaId(id)} />
      </div>
    );
  }

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <ChatInput personaId={personaId} />
    </main>
  );
}


