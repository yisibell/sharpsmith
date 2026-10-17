# API reference

## `new SharpSmith(options?)`

Creates an engine instance.

### `options.concurrentFileLimit`

- Type: `number`
- Default: `Infinity`

Limits the number of images decoded concurrently.

```js
const engine = new SharpSmith({ concurrentFileLimit: 4 });
```

## `SharpSmith.specVersion`

The engine specification version:

```js
SharpSmith.specVersion; // "2.0.0"
```

## `engine.createImage(source, callback)`

Decodes one image. `source` can be a path string or a Vinyl-like object with
`path` and `contents`. `contents` can be a `Buffer`, a Node.js readable stream,
or `null`. A null Vinyl file is read from its `path`.

```ts
(error: Error | null, image?: SharpsmithImage) => void
```

Every image is normalized to four-channel RGBA data:

```ts
{
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
  shape: [number, number, 4];
}
```

## `engine.createImages(sources, callback)`

Decodes multiple images, respecting `concurrentFileLimit`, and returns them in
the same order as `sources`:

```js
engine.createImages(["a.png", "b.png"], (error, images) => {
  if (error) throw error;
  console.log(images[0].width, images[1].height);
});
```

## `engine.createCanvas(width, height)`

Creates a Canvas initialized with transparent black RGBA pixels.

## `canvas.addImage(image, x, y)`

Adds a decoded image. Images are written in insertion order; later images
overwrite earlier pixels, and pixels outside the Canvas are clipped.

## `canvas.export(options?)`

Returns a Node.js readable stream.

`options.format` supports `png` (default), `jpg`, `jpeg`, and `gif`:

```js
const output = canvas.export({ format: "png" });
```

`options.background` accepts an RGBA array and defaults to transparent black:

```js
canvas.export({ background: [255, 255, 255, 255] });
```

`options.quality` is passed to the JPEG encoder:

```js
canvas.export({ format: "jpeg", quality: 90 });
```

Canvas instances are created through `engine.createCanvas()`.
