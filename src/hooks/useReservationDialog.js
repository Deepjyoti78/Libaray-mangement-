import { useEffect } from 'react';

export default function useReservationDialog(cardRef, close, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const homepage = document.querySelector('.site-wrapper');
    const previousInert = homepage?.inert;
    const previousHidden = homepage?.getAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    if (homepage) { homepage.inert = true; homepage.setAttribute('aria-hidden', 'true'); }
    cardRef.current?.querySelector('[data-reservation-autofocus], [data-pass-autofocus]')?.focus({ preventScroll: true });
    const handleKeyDown = (event) => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') { event.preventDefault(); close?.(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...(cardRef.current?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]') || [])]
        .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (homepage) {
        homepage.inert = previousInert;
        if (previousHidden === null) homepage.removeAttribute('aria-hidden');
        else homepage.setAttribute('aria-hidden', previousHidden);
      }
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [cardRef, close, enabled]);
}
