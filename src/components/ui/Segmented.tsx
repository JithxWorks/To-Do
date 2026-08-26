import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}

export function Segmented<T extends string>({ options, value, onChange, name }: Props<T>) {
  return (
    <div className="segment" role="tablist" aria-label={name}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`segment__opt ${active ? 'segment__opt--active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {active && (
              <motion.span
                layoutId={`seg-${name}`}
                className="segment__thumb"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span>
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
