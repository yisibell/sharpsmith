import { Readable } from "node:stream";
import sharp from "sharp";
import type { CanvasExportOptions, CanvasLike } from "./types/canvas.ts";
import type { SharpsmithImage } from "./types/image.ts";

const DEFAULT_FORMAT = "png";
const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "gif"] as const;

type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

function assertFormat(format: string): asserts format is SupportedFormat {
  if (!SUPPORTED_FORMATS.includes(format as SupportedFormat)) {
    throw new Error(
      `\`pixelsmith\` doesn't support exporting "${format}". Please use "jpeg", "png", or "gif"`,
    );
  }
}

function toByte(value: number | undefined): number {
  return value ?? 0;
}

export class Canvas implements CanvasLike {
  static readonly defaultFormat: typeof DEFAULT_FORMAT = DEFAULT_FORMAT;
  static readonly supportedFormats: typeof SUPPORTED_FORMATS = SUPPORTED_FORMATS;

  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;

  private readonly images: Array<{ image: SharpsmithImage; x: number; y: number }> = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  addImage(image: SharpsmithImage, x: number, y: number): void {
    this.images.push({ image, x, y });
  }

  export(options: CanvasExportOptions = {}): Readable {
    const format = options.format ?? Canvas.defaultFormat;
    assertFormat(format);

    if (options.background) {
      for (let index = 0; index < this.data.length; index += 1) {
        this.data[index] = toByte(options.background[index % 4]);
      }
    }

    for (const imageObject of this.images) {
      this.copyImage(imageObject.image, imageObject.x, imageObject.y);
    }

    const encoded = this.encode(format, options);
    return Readable.from(
      (async function* generate() {
        yield await encoded;
      })(),
    );
  }

  private copyImage(image: SharpsmithImage, xOffset: number, yOffset: number): void {
    for (let x = 0; x < image.width; x += 1) {
      for (let y = 0; y < image.height; y += 1) {
        const targetX = xOffset + x;
        const targetY = yOffset + y;

        if (targetX < 0 || targetX >= this.width || targetY < 0 || targetY >= this.height) {
          continue;
        }

        const sourceIndex = (y * image.width + x) * 4;
        const targetIndex = (targetY * this.width + targetX) * 4;

        this.data[targetIndex] = image.data[sourceIndex] ?? 0;
        this.data[targetIndex + 1] = image.data[sourceIndex + 1] ?? 0;
        this.data[targetIndex + 2] = image.data[sourceIndex + 2] ?? 0;
        this.data[targetIndex + 3] = image.data[sourceIndex + 3] ?? 0;
      }
    }
  }

  private encode(format: SupportedFormat, options: CanvasExportOptions): Promise<Buffer> {
    const image = sharp(Buffer.from(this.data), {
      raw: { width: this.width, height: this.height, channels: 4 },
    });

    switch (format) {
      case "jpg":
      case "jpeg":
        return image.jpeg({ quality: options.quality }).toBuffer();
      case "gif":
        return image.gif().toBuffer();
      case "png":
        return image.png().toBuffer();
    }
  }
}

export default Canvas;
