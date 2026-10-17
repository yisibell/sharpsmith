# API

## `new SharpSmith(options?)`

创建一个 engine 实例。

### `options.concurrentFileLimit`

- 类型：`number`
- 默认值：`Infinity`

限制同时解码的图片数量。对于图片数量较多的任务，可以设置为较小的值，
降低文件句柄和内存压力。

```js
const engine = new SharpSmith({ concurrentFileLimit: 4 });
```

## `SharpSmith.specVersion`

engine specification 版本，当前为：

```js
SharpSmith.specVersion; // "2.0.0"
```

## `engine.createImage(source, callback)`

解码一张图片。

### `source`

支持以下输入：

- 文件路径字符串，例如 `"icons/home.png"`
- Vinyl-like 对象：`{ path, contents }`
- `contents` 为 `Buffer`
- `contents` 为 Node.js readable stream
- 空 Vinyl 文件：通过 `isNull()` 返回 `true`，此时从 `path` 读取文件

### callback

```ts
(error: Error | null, image?: SharpsmithImage) => void
```

`image` 包含：

```ts
{
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
  shape: [number, number, 4];
}
```

所有输入图片都会被标准化为 RGBA 四通道数据。

## `engine.createImages(sources, callback)`

批量解码图片，并按输入顺序返回结果。

```js
engine.createImages(
  ["a.png", "b.png"],
  (error, images) => {
    if (error) throw error;
    console.log(images[0].width, images[1].height);
  },
);
```

解码任务会遵守 `concurrentFileLimit`，但返回顺序始终与 `sources` 一致。

## `engine.createCanvas(width, height)`

创建 Canvas。Canvas 使用透明黑色 RGBA 缓冲区初始化。

```js
const canvas = engine.createCanvas(256, 256);
```

## `canvas.addImage(image, x, y)`

把已解码的图片加入 Canvas。图片会在导出时按加入顺序写入；后加入的图片会
覆盖前面图片对应位置的像素。超出 Canvas 边界的像素会被裁剪。

```js
canvas.addImage(image, 10, 20);
```

## `canvas.export(options?)`

返回一个 Node.js readable stream。

### `options.format`

支持：

- `png`，默认值
- `jpg`
- `jpeg`
- `gif`

```js
const output = canvas.export({ format: "png" });
```

### `options.background`

用 RGBA 颜色填充 Canvas 背景。例如：

```js
canvas.export({ background: [255, 255, 255, 255] });
```

如果不设置，背景默认为透明黑色 `[0, 0, 0, 0]`。

### `options.quality`

传给 JPEG 编码器的质量参数，通常为 `1` 到 `100`：

```js
canvas.export({ format: "jpeg", quality: 90 });
```

Canvas 的默认导出格式是 `png`，支持的导出格式为 `jpg`、`jpeg`、`png` 和
`gif`。当前公开入口只导出 engine constructor，Canvas 通过
`engine.createCanvas()` 创建。

