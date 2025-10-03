'use client';

import { useEffect, useState } from 'react';
import type { Persona } from "@/lib/types";
import { useRouter } from 'next/navigation';
import { generateWheelSegments } from '@/lib/generateWheelSegments';

export default function PersonaWheel({ personas }: { personas: Persona[] }) {
  const [segments, setSegments] = useState<any[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (personas.length > 0) {
      const wheelData = generateWheelSegments(
  personas.map(p => ({
    label: p.name,
    value: p.id,
    color: p.color ?? "#ccc", // fallback
  }))
);

      setSegments(wheelData);
    }
  }, [personas]);

  const handleSelect = async (index: number) => {
    const selected = segments[index];
    const res = await fetch(`/api/chat/new?personaId=${selected.id}`, {
  method: 'POST',
});
const { sessionId } = await res.json();
console.log('New session ID:', sessionId);

    router.push(`/chat/${selected.id}/${sessionId}`);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {segments.map((segment, i) => (
          <g
            key={segment.id}
            className="group cursor-pointer"
            onClick={() => handleSelect(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <path
              d={segment.path}
              fill={segment.color}
              stroke="#fff"
              strokeWidth={2}
              className="transition-all duration-200 ease-out hover:scale-[1.03] hover:drop-shadow-md hover:opacity-90 origin-center"
            />
            <image
              href="/icon.svg"
              x={segment.iconX - 12}
              y={segment.iconY - 12}
              width={24}
              height={24}
              className="pointer-events-none"
            />
          </g>
        ))}
      </svg>

      {hoveredIndex !== null && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="bg-white shadow-lg p-4 rounded text-center max-w-xs">
            <h3 className="text-lg font-semibold">{segments[hoveredIndex].name}</h3>
            <p className="text-sm text-gray-600">{segments[hoveredIndex].description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

