'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [personas, setPersonas] = useState<any[]>([])

  useEffect(() => {
    const fetchPersonas = async () => {
      const { data, error } = await supabase.from('personas').select('*')
      if (error) console.error('Supabase error:', error)
      else setPersonas(data)
    }

    fetchPersonas()
  }, [])

  return (
    <div>
      <h1>Personas</h1>
      <ul>
        {personas.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  )
}
