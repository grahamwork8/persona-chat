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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Choose your persona</h2>
      {personas.map((persona) => (
        <div
          key={persona.id}
          className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => handleSelect(persona.id)}
        >
          <p className="font-medium">{persona.name}</p>
          <p className="text-sm text-gray-500 italic">{persona.description}</p>
        </div>
      ))}
    </div>
  );
}

