import { cn } from '@/lib/utils';

/**
 * ChefX mark: a red elliptical ring leaning left (top towards the left), open at the top right, with a dark
 * arrowhead closing the cycle. Built from the same parameters as the 3D ring in the hero.
 */
export const RING = { rx: 0.8, ry: 1.04, tiltDeg: -18, fromDeg: 46, toDeg: 362, arrowGap: 0.55 } as const;
// arrowGap: space between the ring's end and the arrowhead, in stroke widths

const R = 34;
const STROKE = 11;

/** Point on the leaning ellipse, centred on the origin, SVG space (y down); `a` in degrees, counter-clockwise. */
function point(a: number) {
  const rad = (a * Math.PI) / 180;
  const t = (RING.tiltDeg * Math.PI) / 180;
  const x0 = R * RING.rx * Math.cos(rad);
  const y0 = -R * RING.ry * Math.sin(rad);
  return [x0 * Math.cos(t) - y0 * Math.sin(t), x0 * Math.sin(t) + y0 * Math.cos(t)] as const;
}

const RING_PTS = Array.from({ length: 65 }, (_, i) => point(RING.fromDeg + (i / 64) * (RING.toDeg - RING.fromDeg)));

function arrowPoints() {
  const [ex, ey] = point(RING.toDeg);
  const [px, py] = point(RING.toDeg - 1);
  const len = Math.hypot(ex - px, ey - py);
  const [tx, ty] = [(ex - px) / len, (ey - py) / len];
  const [nx, ny] = [-ty, tx];
  // the arrowhead floats just past the ring's end, as in the original mark
  const [bx, by] = [ex + tx * STROKE * RING.arrowGap, ey + ty * STROKE * RING.arrowGap];
  const half = STROKE * 0.9;
  const tip = STROKE * 2.1;
  return [
    [bx + nx * half, by + ny * half],
    [bx + tx * tip, by + ty * tip],
    [bx - nx * half, by - ny * half],
  ] as const;
}
const ARROW_PTS = arrowPoints();

/**
 * The mark isn't symmetric, so centre it on its real outline (ring stroke + arrow), not on the
 * ellipse's centre — otherwise it sits visibly off-centre in the header and the app tile.
 */
const BOUNDS = (() => {
  const xs = [...RING_PTS.flatMap(([x]) => [x - STROKE / 2, x + STROKE / 2]), ...ARROW_PTS.map(([x]) => x)];
  const ys = [...RING_PTS.flatMap(([, y]) => [y - STROKE / 2, y + STROKE / 2]), ...ARROW_PTS.map(([, y]) => y)];
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, size: Math.max(x1 - x0, y1 - y0) };
})();

const f = (n: number) => n.toFixed(2);
const RING_D = RING_PTS.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ');
const ARROW_D = `M${ARROW_PTS.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} Z`;

/** iOS-style app tile: a superellipse ("squircle"), not a plain rounded rectangle. */
const SQUIRCLE_D = (() => {
  const n = 5;
  const pts = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `${f(50 + 50 * Math.sign(c) * Math.abs(c) ** (2 / n))} ${f(50 + 50 * Math.sign(s) * Math.abs(s) ** (2 / n))}`;
  });
  return `M${pts.join(' L')} Z`;
})();

/** Places the centred mark in the 100×100 box; `fill` = share of the box it spans. */
const markTransform = (fill: number) =>
  `translate(50 50) scale(${f((100 * fill) / BOUNDS.size)}) translate(${f(-BOUNDS.cx)} ${f(-BOUNDS.cy)})`;

type LogoMarkProps = {
  className?: string;
  /** Renders the mark on a white iOS-style app tile, like the app icon. */
  tile?: boolean;
  title?: string;
};

export function LogoMark({ className, tile = false, title }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('shrink-0 overflow-visible', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {tile && (
        <>
          <defs>
            <linearGradient id="chefx-tile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#ebebeb" />
            </linearGradient>
          </defs>
          <path d={SQUIRCLE_D} fill="url(#chefx-tile)" />
          {/* hairline edge, like the system's icon border */}
          <path d={SQUIRCLE_D} fill="none" stroke="black" strokeOpacity={0.08} strokeWidth={1} />
        </>
      )}
      <g transform={markTransform(tile ? 0.62 : 0.94)}>
        <path d={RING_D} fill="none" className="stroke-brand" strokeWidth={STROKE} />
        <path d={ARROW_D} fill={tile ? '#1a1a1a' : 'currentColor'} />
      </g>
    </svg>
  );
}

export function Wordmark({ className, tile = true }: { className?: string; tile?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark tile={tile} className={cn('size-7', tile && 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]')} />
      <span className="font-display text-lg leading-none font-semibold tracking-tight">
        Chef<span className="text-brand">X</span>
      </span>
    </span>
  );
}

/** Static markup of the app tile (100×100), shared by the favicon and the OG image. */
export const TILE_SVG = `<path d="${SQUIRCLE_D}" fill="#fff"/><path d="${SQUIRCLE_D}" fill="none" stroke="#000" stroke-opacity="0.08"/><g transform="${markTransform(0.62)}"><path d="${RING_D}" fill="none" stroke="#E02C26" stroke-width="${STROKE}"/><path d="${ARROW_D}" fill="#1a1a1a"/></g>`;
