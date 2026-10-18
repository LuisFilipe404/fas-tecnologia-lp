'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Phone, type ScreenId } from '@/components/hero/phone';

const SCREENS: ScreenId[] = ['mesas', 'pedido', 'comanda', 'conta'];
/** The flow, twice over: a long strip that keeps the section full on wide screens. */
const STRIP = [...SCREENS, ...SCREENS];

/**
 * ChefX screens drifting sideways while the page scrolls. The drift is measured, not a fixed
 * percentage: when the strip is wider than the screen it travels exactly its overflow, so every
 * phone passes through view; when it fits, it stays centred.
 */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (ref.current && strip.current) setOverflow(Math.max(0, strip.current.scrollWidth - ref.current.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });
  // a little lead-in/out margin so the first and last phones aren't flush with the edges
  const pad = overflow ? 24 : 0;
  const x = useTransform(progress, [0.15, 0.85], [pad, -overflow - pad]);
  const rotate = useTransform(progress, [0, 0.5, 1], [-3, 0, 3]);

  return (
    <div ref={ref} className="relative overflow-hidden py-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <motion.div
        ref={strip}
        style={{ x, rotate }}
        className={overflow ? 'flex w-max gap-6 px-6 sm:gap-8' : 'mx-auto flex w-max gap-6 sm:gap-8'}
      >
        {STRIP.map((id, i) => (
          <div key={`${id}-${i}`} aria-hidden={i >= SCREENS.length || undefined} className="w-[200px] shrink-0 drop-shadow-[0_40px_60px_rgba(224,44,38,0.18)] sm:w-[240px]">
            <Phone screen={id} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
