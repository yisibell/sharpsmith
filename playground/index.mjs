import { basename, extname, resolve } from "node:path";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import Spritesmith from "spritesmith";
import SharpSmith from "../dist/index.js";

const spritesRoot = resolve("playground/sprites");

async function generateCategory(inputDir) {
  const category = basename(inputDir);
  const outputDir = resolve("playground/generated", category);
  const files = (await readdir(inputDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(png|jpe?g|gif)$/i.test(extname(entry.name)))
    .map((entry) => resolve(inputDir, entry.name))
    .sort();

  if (files.length === 0) {
    throw new Error(`No supported images found in ${inputDir}`);
  }

  const result = await new Promise((resolveResult, reject) => {
    Spritesmith.run(
      {
        src: files,
        engine: SharpSmith,
        algorithm: "binary-tree",
        padding: 4,
      },
      (error, value) => {
        if (error) reject(error);
        else resolveResult(value);
      },
    );
  });

  const chunks = [];
  for await (const chunk of result.image) {
    chunks.push(typeof chunk === "number" ? Buffer.from([chunk]) : Buffer.from(chunk));
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, `${category}.png`), Buffer.concat(chunks));

  const coordinates = Object.fromEntries(
    Object.entries(result.coordinates).map(([file, value]) => [basename(file), value]),
  );
  await writeFile(
    resolve(outputDir, `${category}.json`),
    `${JSON.stringify(
      {
        files: files.length,
        properties: result.properties,
        coordinates,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Generated ${files.length} sprites from ${inputDir}`);
  console.log(`Spritesheet: ${resolve(outputDir, `${category}.png`)}`);
  console.log(`Coordinates: ${resolve(outputDir, `${category}.json`)}`);
}

const args = process.argv.slice(2).filter((argument) => argument !== "--");
if (args.includes("--all")) {
  const categories = (await readdir(spritesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const category of categories) {
    await generateCategory(resolve(spritesRoot, category));
  }
} else {
  await generateCategory(resolve(args[0] ?? "playground/sprites/currency"));
}
