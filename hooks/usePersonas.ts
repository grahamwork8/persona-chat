import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function usePersonas() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonas = async () => {
      const { data, error } = await supabase.from('personas').select('*');
      if (error) {
        console.error('Error fetching personas:', error);
      } else {
        setPersonas(data);
      }
      setLoading(false);
    };

    fetchPersonas();
  }, []);

  return { personas, loading };
}
