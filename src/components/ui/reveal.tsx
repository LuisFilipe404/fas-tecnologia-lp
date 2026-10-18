'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

const ENTRANCE = { type: 'spring', stiffness: 200, damping: 25 } as const;
export const STAGGER_NORMAL = 0.08;

const SCROLL_ENTER: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: ENTRANCE },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Set when the children are <RevealItem>s: the container stays put and each item enters on its own. */
  stagger?: number;
  as?: 'div' | 'ul' | 'ol' | 'dl';
};

const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const;

/** Scroll-triggered entrance. With `stagger`, children wrapped in <RevealItem> cascade instead. */
export function Reveal({ children, className, stagger = 0, as = 'div' }: RevealProps) {
  if (stagger) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const Comp = motion[as];
  return (
    <Comp className={className} initial="hidden" whileInView="visible" viewport={VIEWPORT} variants={SCROLL_ENTER}>
      {children}
    </Comp>
  );
}

/**
 * One item of a staggered group. Each item watches its own visibility (rather than waiting for a
 * signal from the parent), so an item that re-mounts — new data, hot reload — can't get stuck hidden.
 */
export function RevealItem({
  children,
  className,
  index = 0,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  /** Position in the group; sets the cascade delay. */
  index?: number;
  as?: 'div' | 'li' | 'article';
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ ...ENTRANCE, delay: index * STAGGER_NORMAL }}
    >
      {children}
    </Comp>
  );
}
