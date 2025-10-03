// app/personas/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';

export default async function PersonasPage() {
  const session = await auth();
const userId = session.userId;


  if (!userId) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Please sign in to view your personas.</h1>
      </main>
    );
  }

  const { data: personas, error } = await supabase
    .from('personas')
    .select('*')
    .eq('owner_id', userId);

  if (error) {
    console.error('Error fetching personas:', error);
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Failed to load personas.</h1>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Personas</h1>
      <ul className="space-y-4">
        {personas?.map((p) => (
          <li key={p.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-600">{p.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

