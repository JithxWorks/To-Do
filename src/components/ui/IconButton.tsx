import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  variant?: 'plain' | 'filled' | 'accent';
}

export function IconButton({ label, children, variant = 'plain', className = '', ...rest }: Props) {
  const v =
    variant === 'filled' ? 'icon-btn--filled' : variant === 'accent' ? 'icon-btn--accent' : '';
  return (
    <button type="button" aria-label={label} title={label} className={`icon-btn ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}
