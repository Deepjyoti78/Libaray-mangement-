import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component ensures that route transitions (like clicking on
 * spaces cards from the landing page) instantly start at the top of the new page,
 * preventing the jarring bottom-to-top scroll animation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Temporarily disable smooth scrolling on root so the page resets to top immediately
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    root.scrollTop = 0;
    document.body.scrollTop = 0;

    // Restore after layout paint
    const timer = setTimeout(() => {
      root.style.scrollBehavior = prevBehavior;
    }, 50);

    return () => {
      clearTimeout(timer);
      root.style.scrollBehavior = prevBehavior;
    };
  }, [pathname]);

  return null;
}
