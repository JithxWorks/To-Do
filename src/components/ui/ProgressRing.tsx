import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: ReactNode;
  color?: string;
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  label,
  color = 'var(--accent)',
}: Props) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const center = size / 2;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <motion.circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span className="progress-ring__label" style={{ fontSize: size * 0.26 }}>
        {label ?? `${Math.round(pct)}%`}
      </span>
    </div>
  );
}
