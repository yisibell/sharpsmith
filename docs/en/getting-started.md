# Getting started

## Requirements

- Node.js `>=22`
- pnpm

Install `sharpsmith`:

```bash
pnpm add sharp sharpsmith
```

Install `spritesmith` as well when using the engine through Spritesmith:

```bash
pnpm add spritesmith sharpsmith
```

## Use as a Spritesmith engine

CommonJS:

```js
const Spritesmith = require("spritesmith");
const SharpSmith = require("sharpsmith");

Spritesmith.run(
  {
    src: ["icons/home.png", "icons/settings.png"],
    engine: SharpSmith,
    algorithm: "binary-tree",
    padding: 4,
  },
  (error, result) => {
    if (error) throw error;
    result.image.pipe(process.stdout);
  },
);
```

ESM:

```js
import Spritesmith from "spritesmith";
import SharpSmith from "sharpsmith";

Spritesmith.run(
  { src: ["icons/home.png", "icons/settings.png"], engine: SharpSmith },
  (error, result) => {
    if (error) throw error;
    result.image.pipe(process.stdout);
  },
);
```

The default export is the engine constructor. Its `specVersion` is `2.0.0`.

## Use the engine API directly

```js
import { writeFile } from "node:fs/promises";
import SharpSmith from "sharpsmith";

const engine = new SharpSmith({ concurrentFileLimit: 4 });
const images = await new Promise((resolve, reject) => {
  engine.createImages(["icons/home.png", "icons/settings.png"], (error, value) => {
    if (error) reject(error);
    else resolve(value);
  });
});

const canvas = engine.createCanvas(128, 128);
canvas.addImage(images[0], 0, 0);
canvas.addImage(images[1], 32, 0);

const chunks = [];
for await (const chunk of canvas.export({ format: "png" })) chunks.push(chunk);
await writeFile("sprite.png", Buffer.concat(chunks));
```

In TypeScript:

```ts
import SharpSmith from "sharpsmith";
```
