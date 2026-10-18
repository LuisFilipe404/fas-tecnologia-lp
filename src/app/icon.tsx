import { ImageResponse } from 'next/og';
import { TileImage } from '@/lib/tile-image';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<TileImage size={512} />, size);
}
