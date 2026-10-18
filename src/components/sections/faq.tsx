'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const MICRO = { type: 'spring', stiffness: 400, damping: 30 } as const;
const ENTRANCE = { type: 'spring', stiffness: 200, damping: 25 } as const;

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="focus-text flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-tight hover:text-brand transition-colors"
              >
                {item.q}
                <motion.span
                  aria-hidden
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={MICRO}
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-brand"
                >
                  <svg viewBox="0 0 16 16" className="size-4" fill="none">
                    <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={ENTRANCE}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-muted-foreground leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
