'use client';
import Image from "next/image";
import usePersonas from '@/hooks/usePersonas';
import PersonaWheel from '@/components/PersonaWheel';

export default function HomePage() {
  const { personas, loading } = usePersonas();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Choose Your Persona
      </h1>

      <div className="w-full max-w-5xl">
        {loading ? (
          <p className="text-gray-500 text-center">Loading personas...</p>
        ) : (
          <PersonaWheel personas={personas} />
        )}
      </div>
    </main>
  );
}



