import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to detect when an element has been scrolled past halfway
 * Returns a boolean indicating whether to show the fixed header
 */
export function useScrollVisibility(
  elementRef: RefObject<HTMLElement | null>,
  options?: {
    threshold?: number; // Percentage of element that should be scrolled past (0.5 = halfway)
  }
): boolean {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const elementHeight = rect.height;
      const elementTop = rect.top;
      
      // Find the scrollable container by checking computed styles
      let scrollContainer: HTMLElement | null = element.parentElement;
      while (scrollContainer) {
        const computedStyle = window.getComputedStyle(scrollContainer);
        if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' || 
            computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
          break;
        }
        scrollContainer = scrollContainer.parentElement;
      }
      
      if (!scrollContainer) {
        // Fallback to window scroll
        const threshold = options?.threshold ?? 0.5;
        // When element top is negative, we've scrolled past it
        // Show header when we've scrolled past halfway (element top is less than -half height)
        const shouldShowHeader = elementTop < -elementHeight * threshold;
        setShouldShow(shouldShowHeader);
        return;
      }
      
      // Get container's bounding rect to understand scroll context
      const containerRect = scrollContainer.getBoundingClientRect();
      
      // Calculate element position relative to container top
      const elementRelativeTop = elementTop - containerRect.top;
      const threshold = options?.threshold ?? 0.5;
      
      // Show header when element has been scrolled past halfway
      // This means element's top relative to container is less than negative half its height
      const shouldShowHeader = elementRelativeTop < -elementHeight * threshold;
      
      setShouldShow(shouldShowHeader);
    };

    // Check initial state
    handleScroll();

    // Find scrollable container
    let scrollContainer: HTMLElement | null = element.parentElement;
    while (scrollContainer) {
      const computedStyle = window.getComputedStyle(scrollContainer);
      if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' || 
          computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }

    const target = scrollContainer || window;
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef, options?.threshold]);

  return shouldShow;
}

