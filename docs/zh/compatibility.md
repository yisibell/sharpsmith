# 兼容性与限制

## Node.js

项目目标为 Node.js `22` 及更高版本，构建目标为 `node22`。

## 模块格式

发布包同时提供：

- ESM：`import SharpSmith from "sharpsmith"`
- CommonJS：`const SharpSmith = require("sharpsmith")`
- TypeScript declaration：随 `dist` 一起发布

## 图片输入

底层图片解码由 `sharp` 完成，因此输入格式取决于当前 `sharp`/libvips
构建支持的格式。常用的 PNG、JPEG 和 GIF 均可用于 playground。

输入图片最终都会转换为 RGBA。GIF 输入当前按单张图片处理，Canvas 导出也
不会生成动画帧。

## Canvas 行为

- Canvas 初始内容为透明黑色
- `addImage` 不做 alpha blending，而是直接覆盖目标像素
- 后加入的图片覆盖先加入的图片
- 超出 Canvas 边界的像素会被忽略
- `export()` 返回 readable stream

## Spritesmith 兼容性

`sharpsmith` 实现 `spritesmith-engine-spec@2.0.0` 所需的：

- `specVersion`
- `createImage`
- `createImages`
- `createCanvas`
- Canvas 的 `addImage` 和 `export`

推荐通过 `spritesmith` 的 `engine` 参数使用：

```js
Spritesmith.run({
  src: files,
  engine: SharpSmith,
}, callback);
```

## 依赖说明

`sharp` 是生产依赖。项目 playground 使用的 `spritesmith` 是开发依赖，
它自身可能带入旧版的 `request`、`tough-cookie` 等传递依赖；这些依赖不
会进入 `sharpsmith` 的生产依赖。

