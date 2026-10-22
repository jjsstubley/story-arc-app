import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element has scrolled up out of view, inside whichever
 * container is scrolling (the desktop panel or the mobile drawer). Put the
 * sentinel ref after the content the sticky bar summarises, and the anchor
 * ref on a `position: sticky; top: 0` element at the top of that container.
 */
export function useScrolledPast() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Leaving view at the bottom (e.g. on a short screen) doesn't count, only above the bar's anchor
      const anchorTop = anchorRef.current?.getBoundingClientRect().top ?? 0;
      setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < anchorTop);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, anchorRef, scrolledPast };
}
