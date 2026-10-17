# Compatibility and limitations

## Node.js

The project targets Node.js `22` and newer and builds for `node22`.

## Module formats

The package provides ESM, CommonJS, and TypeScript declarations:

```js
import SharpSmith from "sharpsmith";
const SharpSmith = require("sharpsmith");
```

## Image input

Decoding is provided by `sharp`, so supported formats depend on the installed
`sharp`/libvips build. All decoded images are normalized to RGBA. GIF input is
handled as a single image; Canvas export does not produce animation frames.

## Canvas behavior

- Starts as transparent black
- Directly overwrites pixels; it does not alpha blend
- Later images overwrite earlier images
- Clips pixels outside the Canvas
- `export()` returns a readable stream

## Spritesmith compatibility

The engine implements `spritesmith-engine-spec@2.0.0`: `specVersion`,
`createImage`, `createImages`, `createCanvas`, `addImage`, and `export`.

```js
Spritesmith.run({ src: files, engine: SharpSmith }, callback);
```

## Dependency notes

`sharp` is a production dependency. The playground uses `spritesmith` as a
development dependency; its dependency tree may include legacy packages such
as `request` and `tough-cookie`. They are not production dependencies of
`sharpsmith`.
