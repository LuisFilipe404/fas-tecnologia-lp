import { ImageResponse } from 'next/og';
import { TileImage } from '@/lib/tile-image';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS applies its own mask, so the tile goes edge to edge on white
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#fff' }}>
        <TileImage size={180} />
      </div>
    ),
    size,
  );
}
