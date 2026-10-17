import { strict as assert } from "node:assert";
import { Readable } from "node:stream";
import { test } from "node:test";
import sharp from "sharp";
import Sharpsmith from "../dist/index.js";

async function createImageBuffer(width, height, background) {
  return sharp({
    create: { width, height, channels: 4, background },
  })
    .png()
    .toBuffer();
}

async function collect(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function createImage(engine, source) {
  return new Promise((resolve, reject) => {
    engine.createImage(source, (error, image) => {
      if (error) reject(error);
      else resolve(image);
    });
  });
}

function createImages(engine, sources) {
  return new Promise((resolve, reject) => {
    engine.createImages(sources, (error, images) => {
      if (error) reject(error);
      else resolve(images);
    });
  });
}

test("loads Buffer and Stream image sources", async () => {
  const engine = new Sharpsmith({ concurrentFileLimit: 1 });
  const red = await createImageBuffer(2, 1, { r: 255, g: 0, b: 0, alpha: 1 });
  const blue = await createImageBuffer(1, 2, { r: 0, g: 0, b: 255, alpha: 1 });

  const images = await createImages(engine, [
    { path: "red.png", contents: red },
    { path: "blue.png", contents: Readable.from([blue]) },
  ]);

  assert.deepEqual(
    images.map(({ width, height }) => ({ width, height })),
    [
      { width: 2, height: 1 },
      { width: 1, height: 2 },
    ],
  );
});

test("composes images in insertion order and exports PNG", async () => {
  const engine = new Sharpsmith();
  const red = await createImage(engine, {
    path: "red.png",
    contents: await createImageBuffer(1, 1, { r: 255, g: 0, b: 0, alpha: 1 }),
  });
  const blue = await createImage(engine, {
    path: "blue.png",
    contents: await createImageBuffer(1, 1, { r: 0, g: 0, b: 255, alpha: 1 }),
  });

  const canvas = engine.createCanvas(2, 1);
  canvas.addImage(red, 0, 0);
  canvas.addImage(blue, 1, 0);
  const output = await collect(canvas.export({ background: [0, 0, 0, 255] }));
  const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });

  assert.equal(info.width, 2);
  assert.equal(info.height, 1);
  assert.deepEqual([...data], [255, 0, 0, 255, 0, 0, 255, 255]);
});

test("reports empty inputs and rejects unsupported formats", async () => {
  const engine = new Sharpsmith();

  await assert.rejects(
    createImage(engine, { path: "empty.png", contents: Buffer.alloc(0) }),
    /Expected image "empty\.png" to not be empty/,
  );

  assert.throws(
    () => engine.createCanvas(1, 1).export({ format: "webp" }),
    /doesn't support exporting "webp"/,
  );
});
