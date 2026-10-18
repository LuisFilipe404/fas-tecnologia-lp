'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const ENTRANCE = { type: 'spring', stiffness: 200, damping: 25 } as const;
const MICRO = { type: 'spring', stiffness: 400, damping: 30 } as const;

/**
 * On phones the hero already has a WhatsApp CTA and the floating button would sit on top of the
 * phone visual, so it waits until the hero has been scrolled past. Desktop: always visible.
 */
function useVisible(heroId: string) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById(heroId);
    const mq = window.matchMedia('(min-width: 768px)');
    let heroInView = true;
    const update = () => setVisible(mq.matches || !heroInView);
    const io = new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      update();
    });
    if (hero) io.observe(hero);
    mq.addEventListener('change', update);
    update();
    return () => {
      io.disconnect();
      mq.removeEventListener('change', update);
    };
  }, [heroId]);
  return visible;
}

/** Floating WhatsApp shortcut, bottom right — in WhatsApp's own green, the one exception to the red palette. */
export function WhatsAppButton({ href, heroId = 'top' }: { href: string; heroId?: string }) {
  const visible = useVisible(heroId);
  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener"
          aria-label="Falar com a equipe ChefX pelo WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ ...ENTRANCE, delay: 0.3 }}
          whileHover={{ scale: 1.06, transition: MICRO }}
          whileTap={{ scale: 0.95, transition: MICRO }}
          className="fixed right-5 bottom-5 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.55)] transition-colors hover:bg-[#1EBE5A] md:right-8 md:bottom-8"
        >
          <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
            <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 6.99c0 5.45-4.44 9.88-9.9 9.88Zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 0 0-3.48-8.41Z" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
