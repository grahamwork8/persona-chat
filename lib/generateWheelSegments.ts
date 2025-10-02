// lib/generateWheelSegments.ts
import { describeArc, polarToCartesian } from './describeArc';

const colors = [
  '#FF6B6B', '#6BCB77', '#4D96FF', '#FFC75F',
  '#F9F871', '#A66DD4', '#FF9F1C', '#2EC4B6',
];

type Segment = { label: string; value: number }; 
export function generateWheelSegments(personas: Segment[], radius = 180) {
  const angleStep = (2 * Math.PI) / personas.length;

  return personas.map((persona, i) => {
    const startAngle = i * angleStep;
    const endAngle = startAngle + angleStep;
    const midAngle = startAngle + angleStep / 2;

    const path = describeArc(200, 200, radius, startAngle, endAngle);
    const iconPos = polarToCartesian(200, 200, radius * 0.6, midAngle); // 60% radius

    return {
      ...persona,
      path,
      index: i,
      color: persona.color || colors[i % colors.length],
      iconX: iconPos.x,
      iconY: iconPos.y,
    };
  });
}

