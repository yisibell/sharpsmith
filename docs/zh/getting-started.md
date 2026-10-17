# 快速开始

## 环境要求

- Node.js `>=22`
- pnpm

安装依赖：

```bash
pnpm add sharp
```

安装 `sharpsmith` 后，可以把它作为 `spritesmith` 的 engine 使用：

```bash
pnpm add spritesmith sharpsmith
```

## 作为 Spritesmith engine

CommonJS：

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

    // result.image: 生成的 PNG readable stream
    // result.coordinates: 每张源图的位置和尺寸
    // result.properties: sprite sheet 的 width 和 height
    result.image.pipe(process.stdout);
  },
);
```

ESM：

```js
import Spritesmith from "spritesmith";
import SharpSmith from "sharpsmith";

Spritesmith.run(
  {
    src: ["icons/home.png", "icons/settings.png"],
    engine: SharpSmith,
  },
  (error, result) => {
    if (error) throw error;
    result.image.pipe(process.stdout);
  },
);
```

`sharpsmith` 的默认导出就是 engine constructor，因此可以直接传给
`engine`。它的 `specVersion` 为 `2.0.0`。

## 直接使用 engine API

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
for await (const chunk of canvas.export({ format: "png" })) {
  chunks.push(chunk);
}
await writeFile("sprite.png", Buffer.concat(chunks));
```

如果项目使用 TypeScript，可以直接导入默认导出：

```ts
import SharpSmith from "sharpsmith";
```

