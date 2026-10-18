import { ImageResponse } from 'next/og';
import { TileImage } from '@/lib/tile-image';

export const alt = 'ChefX — comanda digital para restaurantes de todo o Brasil';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: 'radial-gradient(circle at 80% 40%, rgba(224,44,38,0.32), #000 55%)',
          color: '#f5f5f5',
        }}
      >
        <TileImage size={120} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            Pediu. Enviou. Fechou.
          </div>
          <div style={{ marginTop: 28, fontSize: 34, color: '#8a8a8a' }}>
            ChefX · comanda digital para restaurantes de todo o Brasil
          </div>
        </div>
      </div>
    ),
    size,
  );
}
