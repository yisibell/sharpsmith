# Playground

Playground 用来使用真实图标验证 `spritesmith + sharpsmith` 的集成结果。

## 目录结构

每个分类放在 `playground/sprites/<category>/`：

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

可以继续添加分类，例如：

```text
playground/sprites/social/
playground/sprites/weather/
```

脚本会读取目录中的 `png`、`jpg`、`jpeg` 和 `gif` 文件，并按文件名排序。

## 生成单个分类

默认生成 currency：

```bash
pnpm playground
```

指定分类目录：

```bash
pnpm playground -- playground/sprites/payment
```

输出结构：

```text
playground/generated/payment/payment.png
playground/generated/payment/payment.json
```

JSON 文件包含：

- `files`：输入图片数量
- `properties.width` / `properties.height`：sprite sheet 尺寸
- `coordinates`：每个文件的 `x`、`y`、`width`、`height`

## 一次生成全部分类

```bash
pnpm playground:all
```

脚本会扫描 `playground/sprites/` 下的一级子目录，并分别生成：

```text
playground/generated/currency/currency.png
playground/generated/filter/filter.png
playground/generated/icon/icon.png
playground/generated/payment/payment.png
```

当前 playground 使用 `binary-tree` 布局算法和 `padding: 4`。

## 直接运行脚本

如果已经完成构建，也可以跳过再次构建：

```bash
node playground/index.mjs --all
node playground/index.mjs playground/sprites/icon
```

