import { motion } from 'framer-motion';

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? 'switch--on' : ''}`}
      onClick={() => onChange(!checked)}
      style={{ justifyContent: checked ? 'flex-end' : 'flex-start' }}
    >
      <motion.span
        layout
        className="switch__knob"
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
      />
    </button>
  );
}
