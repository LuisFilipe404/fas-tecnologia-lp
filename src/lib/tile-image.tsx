import { TILE_SVG } from '@/components/brand/logo-mark';

/** The ChefX app tile as an <img> for next/og (Satori renders SVG from data URIs). */
export function TileImage({ size }: { size: number }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${TILE_SVG}</svg>`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt="" width={size} height={size} src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} />;
}
