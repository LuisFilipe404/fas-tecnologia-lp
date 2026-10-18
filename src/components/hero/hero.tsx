'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { cn } from '@/lib/utils';
import { Phone, type ScreenId } from './phone';
import {
  CANVAS_SCALE,
  HERO_END,
  LOGO_START,
  PHONE_ASPECT,
  PHONE_DEPTH,
  PHONE_HEIGHT,
  PHONE_RADIUS,
  phoneTransform,
} from './scene-config';

const RibbonScene = dynamic(() => import('./ribbon-scene'), { ssr: false });

/**
 * three.js is the heaviest thing on the page (~900 KB parsed), so it isn't fetched during the
 * initial load: it waits for the first sign of a person (pointer, touch, wheel, key) or, failing
 * that, a quiet moment a few seconds after load. The ribbon then draws itself in.
 */
function useDeferred3d() {
  const [load, setLoad] = useState(false);
  useEffect(() => {
    let timer = 0;
    let idle = 0;
    // real input only: a 'scroll' event also fires when the browser jumps to a #hash or restores the
    // scroll position on load, which would pull three.js into the initial load
    const events = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    const go = () => setLoad(true);
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    const schedule = () => {
      timer = window.setTimeout(() => {
        if ('requestIdleCallback' in window) idle = window.requestIdleCallback(go, { timeout: 2000 });
        else go();
      }, 4000);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      window.removeEventListener('load', schedule);
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, []);
  return load;
}

const ENTRANCE = { type: 'spring', stiffness: 200, damping: 25 } as const;

/** Stacked slabs behind the screen give the CSS phone a solid, visible edge. */
const EDGE_LAYERS = 8;

/** `short` is the phone copy: on small screens the visual gets the room instead. */
type Step = { word: string; screen: ScreenId; text: string; short: string };
type Cta = { href: string; label: string };

const WORD = {
  // no opacity/blur: the headline is the LCP element, so it must be painted from the server HTML
  hidden: { y: 40 },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: ENTRANCE },
};

/** Copy stacked in one slot; inactive copy stays in the DOM for crawlers but is hidden from AT. */
function Layer({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      aria-hidden={!active}
      initial={false}
      animate={active ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 16, filter: 'blur(8px)' }}
      transition={ENTRANCE}
      className={cn('absolute inset-x-0 top-0', !active && 'pointer-events-none')}
    >
      {children}
    </motion.div>
  );
}

export function Hero({ steps, primary, secondary }: { steps: readonly Step[]; primary: Cta; secondary: Cta }) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, restDelta: 0.0005 });
  const inView = useInView(ref);
  const load3d = useDeferred3d();

  // -1 = hero, 0..n-1 = step, n = the ribbon has become the logo
  const [phase, setPhase] = useState(-1);
  const logo = phase === steps.length;
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (p < HERO_END) return setPhase(-1);
    if (p >= LOGO_START) return setPhase(steps.length);
    const f = (p - HERO_END) / (LOGO_START - HERO_END);
    setPhase(Math.min(steps.length - 1, Math.floor(f * steps.length)));
  });

  const screen: ScreenId = phase < 0 ? 'mesas' : steps[Math.min(phase, steps.length - 1)].screen;
  // the phone steps aside while the ribbon winds into the logo
  const phoneOpacity = useTransform(smooth, [LOGO_START, LOGO_START + 0.06], [1, 0]);
  const phoneScale = useTransform(smooth, [LOGO_START, LOGO_START + 0.08], [1, 0.85]);

  return (
    <section ref={ref} id="top" aria-label="ChefX, comanda digital" className="relative h-[460vh]">
      <div id="como-funciona" className="absolute top-[100vh]" />

      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_75%_50%,rgba(224,44,38,0.16),transparent_70%)]"
        />

        {/* mobile: a column where the visual takes whatever height is left (down to 320×568); md+: two columns */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 pt-[clamp(6.25rem,13svh,7.25rem)] pb-4 sm:px-6 md:grid md:grid-cols-[1.1fr_1fr] md:content-center md:items-center md:gap-8 md:px-12 md:py-0">
          {/* words */}
          <div className="relative z-10 shrink-0">
            <motion.h1
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.12, delayChildren: 0.2 }}
              className="text-[min(15vw,8.5svh,4.5rem)] font-semibold leading-[0.88] tracking-[-0.055em] md:text-[clamp(4.5rem,9.2vw,9rem)]"
            >
              {steps.map((s, i) => {
                const lit = phase < 0 || logo ? i === steps.length - 1 : phase === i;
                return (
                  <motion.span key={s.word} variants={WORD} className="block">
                    <motion.span
                      initial={false}
                      animate={{ color: lit ? 'var(--brand)' : phase < 0 || logo ? '#f5f5f5' : '#2e2e2e' }}
                      transition={{ duration: 0.4 }}
                    >
                      {s.word}
                    </motion.span>
                  </motion.span>
                );
              })}
            </motion.h1>

            <div className="relative mt-5 h-[4.25rem] md:mt-10 md:h-44">
              <Layer active={phase < 0}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...ENTRANCE, delay: 0.7 }}
                >
                  {/* phones: headline + buttons only, so the visual gets the room */}
                  <p className="max-w-md text-xl leading-relaxed text-muted-foreground max-md:hidden">
                    O <span className="text-foreground">ChefX</span> é a comanda digital para restaurantes de todo o
                    Brasil: do pedido na mesa ao fechamento da conta, tudo no celular do atendente.
                  </p>
                  <div className="flex gap-2 sm:gap-3 md:mt-8">
                    <a
                      href={primary.href}
                      target="_blank"
                      rel="noopener"
                      tabIndex={phase < 0 ? undefined : -1}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-soft sm:flex-none sm:px-6"
                    >
                      {primary.label}
                      {/* on the narrowest phones the arrow would push the button past the edge */}
                      <span aria-hidden className="max-[359px]:hidden">
                        →
                      </span>
                    </a>
                    <a
                      href={secondary.href}
                      target="_blank"
                      rel="noopener"
                      tabIndex={phase < 0 ? undefined : -1}
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] text-sm font-medium text-white/80 transition-colors hover:text-white max-sm:w-12 sm:px-6"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                        <path fill="currentColor" d="M4 2.5v19l10-9.5L4 2.5Zm11.4 8.1 2.9-2.8-11-6.3 8.1 9.1Zm0 2.8-8.1 9.1 11-6.3-2.9-2.8Zm4.3-4.2-2.8 2.8 2.8 2.8 2.3-1.3c.9-.5.9-2.5 0-3l-2.3-1.3Z" />
                      </svg>
                      {/* icon-only on phones; the label stays for screen readers */}
                      <span className="max-sm:sr-only">{secondary.label}</span>
                    </a>
                  </div>
                </motion.div>
              </Layer>

              {steps.map((s, i) => (
                <Layer key={s.word} active={phase === i}>
                  <p className="text-xs font-medium text-brand md:text-sm">
                    Como funciona · {i + 1} de {steps.length}
                  </p>
                  <p className="mt-1.5 max-w-md text-[15px] leading-snug text-white/80 md:mt-3 md:text-2xl">
                    <span className="md:hidden">{s.short}</span>
                    <span className="max-md:hidden">{s.text}</span>
                  </p>
                </Layer>
              ))}

              <Layer active={logo}>
                <p className="text-xs font-medium text-brand md:text-sm">ChefX</p>
                <p className="mt-1.5 max-w-md text-[15px] leading-snug text-white/80 md:mt-3 md:text-2xl">
                  <span className="md:hidden">A conta fecha e o ciclo recomeça.</span>
                  <span className="max-md:hidden">
                    A conta fecha, a mesa libera e o ciclo recomeça. Do jeito que o seu salão gira.
                  </span>
                </p>
              </Layer>
            </div>
          </div>

          {/* phone wrapped by the ribbon */}
          {/* mobile: fills the space left under the buttons, centred */}
          <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center max-md:-translate-x-[4%] md:mt-0 md:block md:flex-none">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTRANCE, delay: 0.35 }}
            className="relative mx-auto aspect-[3/4] h-full max-w-full [container-type:size] md:mt-12 md:h-[min(74svh,56vw)]"
          >
            <motion.div
              className="absolute top-1/2 left-1/2"
              style={{
                height: `${PHONE_HEIGHT * 100}%`,
                aspectRatio: PHONE_ASPECT,
                x: '-50%',
                y: '-50%',
                opacity: phoneOpacity,
                scale: phoneScale,
              }}
            >
              {/* same transform the WebGL mask is projected with — see scene-config */}
              <div
                className="relative size-full [transform-style:preserve-3d]"
                style={{ transform: phoneTransform((box) => `${box * 100}cqh`) }}
              >
                {Array.from({ length: EDGE_LAYERS }, (_, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      borderRadius: `${PHONE_RADIUS * 100}% / ${PHONE_RADIUS * PHONE_ASPECT * 100}%`,
                      transform: `translateZ(${(-(i + 1) / EDGE_LAYERS) * PHONE_DEPTH * 100}cqh)`,
                      background: i === EDGE_LAYERS - 1 ? '#0c0c0c' : `hsl(0 0% ${26 - i * 1.2}%)`,
                    }}
                  />
                ))}
                <Phone screen={screen} className="h-full" />
              </div>
            </motion.div>
            <div
              className="pointer-events-none absolute"
              style={{ inset: `${(-(CANVAS_SCALE - 1) / 2) * 100}%` }}
            >
              {load3d && <RibbonScene progress={smooth} reduced={reduced} active={inView} />}
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
