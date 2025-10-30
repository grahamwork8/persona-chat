"use client";

import { useEffect, useState } from "react";

export default function PersonaSelector({
  onSelect
}: {
  onSelect: (personaId: string) => void;
}) {
  const [personas, setPersonas] = useState<
    { id: string; name: string; description: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonas = async () => {
      const res = await fetch("/api/personas", { credentials: "include" });
      const data = await res.json();
      setPersonas(data.personas || []);
      setLoading(false);
    };

    fetchPersonas();
  }, []);

  const handleSelect = async (personaId: string) => {
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ personaId })
    });

    onSelect(personaId);
  };

  if (loading) {
    return <p className="text-gray-500">Loading personas...</p>;
  }

  
}

