"use client";

import { useState, useEffect } from "react";

/**
 * Returns whether the given media query matches.
 * SSR-safe: returns false on the server / initial render.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    function handler(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
