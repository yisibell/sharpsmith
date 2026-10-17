import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import sharp from "sharp";
import Canvas from "./canvas.ts";
import type {
  ErrorFirstCallback,
  ImageSource,
  SharpsmithImage,
  SharpsmithOptions,
} from "./types/index.ts";

function isReadable(value: unknown): value is Readable {
  return (
    value instanceof Readable || Boolean(value && typeof (value as Readable).pipe === "function")
  );
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function sourceToBuffer(source: ImageSource): Promise<{ buffer: Buffer; path: string }> {
  if (typeof source === "string") {
    return { buffer: await readFile(source), path: source };
  }

  const path = source.path;
  const contents = source.contents;
  const isNull = source.isNull?.() ?? contents === null;

  if (isNull) {
    return { buffer: await readFile(path), path };
  }
  if (Buffer.isBuffer(contents)) {
    return { buffer: contents, path };
  }
  if (isReadable(contents)) {
    return { buffer: await streamToBuffer(contents), path };
  }

  throw new Error(`Unrecognized Vinyl type for "${path}"`);
}

function normalizePixels(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): Uint8ClampedArray {
  if (channels === 4) {
    return new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
  }

  const normalized = new Uint8ClampedArray(width * height * 4);
  for (let index = 0, output = 0; index < width * height; index += 1) {
    const input = index * channels;
    const value = data[input] ?? 0;
    normalized[output] = channels <= 2 ? value : (data[input] ?? 0);
    normalized[output + 1] = channels <= 2 ? value : (data[input + 1] ?? 0);
    normalized[output + 2] = channels <= 2 ? value : (data[input + 2] ?? 0);
    normalized[output + 3] = channels === 2 ? (data[input + 1] ?? 255) : 255;
    output += 4;
  }
  return normalized;
}

export class Sharpsmith {
  static readonly specVersion = "2.0.0";

  readonly concurrentFileLimit: number;

  constructor(options: SharpsmithOptions = {}) {
    this.concurrentFileLimit = options.concurrentFileLimit || Infinity;
  }

  createCanvas(width: number, height: number): Canvas {
    return new Canvas(width, height);
  }

  createImage(source: ImageSource, callback: ErrorFirstCallback<SharpsmithImage>): void {
    void this.loadImage(source).then(
      (image) => callback(null, image),
      (error: unknown) => callback(toError(error)),
    );
  }

  createImages(sources: ImageSource[], callback: ErrorFirstCallback<SharpsmithImage[]>): void {
    void this.loadImages(sources).then(
      (images) => callback(null, images),
      (error: unknown) => callback(toError(error)),
    );
  }

  private async loadImage(source: ImageSource): Promise<SharpsmithImage> {
    const { buffer, path } = await sourceToBuffer(source);
    if (buffer.length === 0) {
      throw new Error(`Expected image "${path}" to not be empty but it was`);
    }

    try {
      const result = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
      const data = normalizePixels(
        result.data,
        result.info.width,
        result.info.height,
        result.info.channels,
      );
      return {
        width: result.info.width,
        height: result.info.height,
        data,
        shape: [result.info.width, result.info.height, 4],
      };
    } catch (error) {
      if (error instanceof Error) {
        error.message += ` (${path})`;
      }
      throw error;
    }
  }

  private async loadImages(sources: ImageSource[]): Promise<SharpsmithImage[]> {
    const results = new Array<SharpsmithImage>(sources.length);
    const limit = Math.max(1, Math.min(this.concurrentFileLimit, sources.length || 1));
    let nextIndex = 0;

    const worker = async (): Promise<void> => {
      while (nextIndex < sources.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await this.loadImage(sources[index]);
      }
    };

    await Promise.all(Array.from({ length: limit }, () => worker()));
    return results;
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export default Sharpsmith;
