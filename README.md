# sharpsmith

A `spritesmith` engine powered by `sharp`, targeting Node.js 22 and newer.

[English](./README.md) · [简体中文](./README.zh.md)

See the complete bilingual documentation in [`docs/`](./docs/README.md).

## Usage

Use it as a `spritesmith` engine:

```js
const Spritesmith = require("spritesmith");
const SharpSmith = require("sharpsmith");

Spritesmith.run(
  {
    src: ["icons/home.png", "icons/settings.png"],
    engine: SharpSmith,
  },
  (error, result) => {
    if (error) throw error;

    // result.image is a readable stream.
    // result.coordinates contains each source image's position.
    // result.properties contains the spritesheet dimensions.
  },
);
```

The engine also supports the `spritesmith-engine-spec@2.0.0` interface directly:

```js
const engine = new SharpSmith({ concurrentFileLimit: 4 });

engine.createImages(["a.png", "b.png"], (error, images) => {
  if (error) throw error;

  const canvas = engine.createCanvas(128, 128);
  canvas.addImage(images[0], 0, 0);
  canvas.addImage(images[1], 32, 0);

  const output = canvas.export({ format: "png" });
  output.pipe(process.stdout);
});
```

Supported output formats are `png`, `jpg`, `jpeg`, and `gif`. Input files,
Vinyl buffers, and Vinyl streams are supported.

## Development

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the real spritesmith integration playground with the bundled currency sprites:

```bash
pnpm playground
```

You can also provide another image directory:

```bash
pnpm playground -- /path/to/icons
```

Generate all sprite categories at once:

```bash
pnpm playground:all
```

It writes output using the input directory name, for example
`playground/generated/currency/currency.png` and
`playground/generated/currency/currency.json`.
