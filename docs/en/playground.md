# Playground

The playground verifies the real `spritesmith + sharpsmith` integration using
assets stored in the repository.

## Directory structure

Put each category in `playground/sprites/<category>/`:

```text
playground/
├── sprites/
│   ├── currency/
│   ├── filter/
│   ├── icon/
│   └── payment/
├── generated/
└── index.mjs
```

The script reads `png`, `jpg`, `jpeg`, and `gif` files and sorts them by name.

## Generate one category

```bash
pnpm playground
pnpm playground -- playground/sprites/payment
```

For `payment`, the output is:

```text
playground/generated/payment/payment.png
playground/generated/payment/payment.json
```

The JSON contains `files`, `properties.width`, `properties.height`, and a
`coordinates` entry with `x`, `y`, `width`, and `height` for each source file.

## Generate every category

```bash
pnpm playground:all
```

The command scans first-level directories under `playground/sprites/` and
generates one output directory per category. It uses the `binary-tree` layout
algorithm with `padding: 4`.

## Run directly

After building:

```bash
node playground/index.mjs --all
node playground/index.mjs playground/sprites/icon
```
