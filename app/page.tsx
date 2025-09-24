'use client';
import Image from "next/image";

import usePersonas from '@/hooks/usePersonas';
import PersonaWheel from '@/components/PersonaWheel';

export default function HomePage() {
  const { personas, loading } = usePersonas();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      {loading ? (
        <p className="text-gray-500">Loading personas...</p>
      ) : (
        <PersonaWheel personas={personas} />
      )}
    </main>
  );
}



