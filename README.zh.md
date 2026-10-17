# sharpsmith

基于 `sharp` 的 `spritesmith` 引擎，支持 Node.js 22 及更高版本。

[English](./README.md) · [简体中文](./README.zh.md)

完整双语文档请查看 [`docs/`](./docs/README.md)。

## 安装

```bash
pnpm add sharpsmith
```

## 作为 Spritesmith 引擎使用

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

    // result.image 是生成的 readable stream
    // result.coordinates 是每张源图的位置和尺寸
    // result.properties 是 sprite sheet 的尺寸
  },
);
```

## 直接使用 Engine API

```js
import SharpSmith from "sharpsmith";

const engine = new SharpSmith({ concurrentFileLimit: 4 });

engine.createImages(["a.png", "b.png"], (error, images) => {
  if (error) throw error;

  const canvas = engine.createCanvas(128, 128);
  canvas.addImage(images[0], 0, 0);
  canvas.addImage(images[1], 32, 0);

  canvas.export({ format: "png" }).pipe(process.stdout);
});
```

支持的导出格式：`png`、`jpg`、`jpeg` 和 `gif`。输入支持文件路径、Vinyl
Buffer 和 Vinyl readable stream。

## Playground

使用内置图标运行单个分类：

```bash
pnpm playground
pnpm playground -- playground/sprites/payment
```

一次生成所有分类：

```bash
pnpm playground:all
```

输出目录格式：

```text
playground/generated/<category>/<category>.png
playground/generated/<category>/<category>.json
```

## 开发

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

更多内容请查看：

- [中文快速开始](./docs/zh/getting-started.md)
- [中文 API 文档](./docs/zh/api.md)
- [中文 Playground 文档](./docs/zh/playground.md)
- [English / 中文 documentation](./docs/README.md)

