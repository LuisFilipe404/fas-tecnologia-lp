'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Wordmark } from '@/components/brand/logo-mark';
import { cn } from '@/lib/utils';

const ENTRANCE = { type: 'spring', stiffness: 200, damping: 25 } as const;
const MICRO = { type: 'spring', stiffness: 400, damping: 30 } as const;

export type NavLink = { href: string; label: string };

/** The section currently being read: the last link target whose top has passed 40% of the viewport. */
function useActiveSection(hrefs: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const href of hrefs) {
        const el = document.querySelector(href);
        if (el && el.getBoundingClientRect().top <= line) current = href;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [hrefs]);
  return active;
}

const STAGGER = 0.05;

/** Burger ↔ close icon: three bars that fold into an X. */
function BurgerIcon({ open }: { open: boolean }) {
  const bar = 'absolute left-0 h-[1.5px] w-full rounded-full bg-current';
  return (
    <span aria-hidden className="relative block h-3.5 w-5">
      <motion.span className={cn(bar, 'top-0')} animate={open ? { top: '50%', y: '-50%', rotate: 45 } : { top: '0%', y: '0%', rotate: 0 }} transition={MICRO} />
      <motion.span className={cn(bar, 'top-1/2 -translate-y-1/2')} animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.15 }} />
      <motion.span className={cn(bar, 'bottom-0')} animate={open ? { bottom: '50%', y: '50%', rotate: -45 } : { bottom: '0%', y: '0%', rotate: 0 }} transition={MICRO} />
    </span>
  );
}

export function Nav({ links, cta }: { links: NavLink[]; cta: NavLink }) {
  const hrefs = useMemo(() => links.map((l) => l.href), [links]);
  const active = useActiveSection(hrefs);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const external = cta.href.startsWith('http');

  // while the menu is open: lock the page scroll, close on Escape, and hand focus back on close
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const toggle = toggleRef.current;
    return () => {
      root.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [open]);

  // the menu is mobile-only: close it if the viewport grows past the breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...ENTRANCE, delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-[60] px-4 pt-4"
      >
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border bg-black/70 px-4 py-2.5 backdrop-blur-xl"
        >
          <a href="#top" aria-label="ChefX — início" className="rounded-full" onClick={() => setOpen(false)}>
            <Wordmark tile={false} />
          </a>
          <ul className="hidden items-center gap-4 text-sm md:flex">
            {links.map((l) => {
              const current = active === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={current ? 'location' : undefined}
                    className={cn(
                      'focus-text rounded-full px-3 py-1.5 transition-colors',
                      current ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <a
            href={cta.href}
            target={external ? '_blank' : undefined}
            rel="noopener"
            className="hidden rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-soft md:inline-flex"
          >
            {cta.label}
          </a>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((o) => !o)}
            className="-mr-1 grid size-10 place-items-center rounded-full text-foreground md:hidden"
          >
            <BurgerIcon open={open} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] flex flex-col bg-black/95 px-6 pt-28 pb-10 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Menu" className="flex-1">
              <ul className="divide-y divide-border border-y border-border">
                {links.map((l, i) => {
                  const current = active === l.href;
                  return (
                    <motion.li
                      key={l.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...ENTRANCE, delay: 0.05 + i * STAGGER }}
                    >
                      <a
                        ref={i === 0 ? firstLinkRef : undefined}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        aria-current={current ? 'location' : undefined}
                        className={cn(
                          'focus-text flex items-center justify-between py-5 text-3xl font-semibold tracking-tight',
                          current ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {l.label}
                        <span aria-hidden className={cn('text-xl', current ? 'text-brand' : 'text-border')}>
                          →
                        </span>
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            <motion.a
              href={cta.href}
              target={external ? '_blank' : undefined}
              rel="noopener"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...ENTRANCE, delay: 0.05 + links.length * STAGGER }}
              className="flex items-center justify-center gap-2 rounded-full bg-brand py-4 text-base font-semibold text-brand-foreground"
            >
              {cta.label} <span aria-hidden>→</span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
