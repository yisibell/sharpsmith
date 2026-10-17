import type { Readable } from "node:stream";
import type { SharpsmithImage } from "./image.ts";

export interface CanvasExportOptions {
  format?: "jpg" | "jpeg" | "png" | "gif";
  background?: [number, number, number, number] | number[];
  quality?: number;
}

export interface CanvasLike {
  readonly width: number;
  readonly height: number;
  addImage(image: SharpsmithImage, x: number, y: number): void;
  export(options?: CanvasExportOptions): Readable;
}
