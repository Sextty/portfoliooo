import { useCallback } from "react";

/**
 * Cursor-following spotlight for cards. Pair with the `.spotlight` class:
 * the handler feeds the cursor position into --mx/--my CSS variables.
 */
export function useSpotlight() {
  return useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
}
