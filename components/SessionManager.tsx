'use client';

import { useEffect, useState } from 'react';

export default function SessionManager({
  sessionId,
  personaId,
  setSessionId,
}: {
  sessionId: string;
  personaId: string;
  setSessionId: (id: string) => void;
}) {
  type Session = {
  id: string;
  name: string | null;
  persona_id: string;
  created_at: string;
};

const [sessions, setSessions] = useState<Session[]>([]);

  const [newName, setNewName] = useState('');

useEffect(() => {
  const loadSessions = async () => {
    try {
      const res = await fetch('/api/session/list');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Session fetch error:', err);
      setSessions([]);
    }
  };

  loadSessions();
}, []);



  const renameSession = async () => {
    if (!sessionId || !newName.trim()) return;
    await fetch('/api/session/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, name: newName }),
    });
    setNewName('');
    const res = await fetch('/api/session/list');
    const data = await res.json();
    setSessions(data.sessions);
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <select
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        className="border p-2 rounded"
      >
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name || 'Untitled Session'}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Rename session"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={renameSession} className="bg-blue-600 text-white px-3 py-1 rounded">
        Save
      </button>
    </div>
  );
}
