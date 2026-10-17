import type { Readable } from "node:stream";

export type PixelData = Uint8Array | Uint8ClampedArray;

export interface SharpsmithImage {
  width: number;
  height: number;
  data: PixelData;
  shape: [number, number, 4];
}

export interface VinylLike {
  path: string;
  contents: Buffer | Readable | null;
  isNull?: () => boolean;
  isBuffer?: () => boolean;
  isStream?: () => boolean;
}

export type ImageSource = string | VinylLike;
