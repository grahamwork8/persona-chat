'use client';

import { useParams } from 'next/navigation';
import ChatInput from '@/components/ChatInput';

export default function ChatPage() {
  const { personaId } = useParams();

  if (!personaId || typeof personaId !== 'string') {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Invalid persona ID.
      </div>
    );
  }

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <ChatInput personaId={personaId} />
    </main>
  );
}
