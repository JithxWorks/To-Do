import type { CSSProperties } from 'react';

/** Returns an inline style setting the --hue custom property to a token color. */
export function hueVar(color: string): CSSProperties {
  return { ['--hue']: `var(--${color})` } as CSSProperties;
}
