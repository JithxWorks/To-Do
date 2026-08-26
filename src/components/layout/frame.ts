import { createContext, useContext } from 'react';

/** The `.app-frame` element, used as a portal target so overlays (sheets,
 *  dialogs) are positioned relative to the phone frame rather than the page. */
export const FrameContext = createContext<HTMLElement | null>(null);

export function useFrame(): HTMLElement | null {
  return useContext(FrameContext);
}
