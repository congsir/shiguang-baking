# 拾光烘焙有限公司 · 官网示意站

精品蛋糕 / 手工面包 / 法式糕点品牌官网。品牌自拟：可可深棕 + 奶油 + 黄油金 + 玫瑰脆皮点缀；首屏为克制的暖光面团层叠 WebGL 氛围层。

## 本地预览

```bash
cd /workspace/shiguang-baking
python3 -m http.server 8794
# 浏览器打开 http://127.0.0.1:8794/
```

## 品牌色板

| Token | Hex | 用途 |
|-------|-----|------|
| Cocoa Ink | `#2A1F1A` | 主背景 / 导航深色 |
| Cocoa Deep | `#1A1410` | 更深底 |
| Cocoa | `#3D2B24` | 次级深棕 |
| Cream | `#F7F1E8` | 浅色区块底 |
| Soft Butter | `#E8D5A3` | 辅助奶油黄 |
| Butter Gold | `#D4A84B` | 强调 / CTA |
| Rose Crust | `#C4785A` | 脆皮点缀 |

## Logo 概念

「拾」拾起片刻 ×「光」揉进面团：圆形印章中层层酥皮弧线 + 上方黄油金光晕，可缩为 favicon。

## 结构

- `index.html` / `css/style.css` / `js/main.js` — 页面与 GSAP 交互
- `src/gl.js` → `js/gl.bundle.js` — Three.js 暖光面团首屏（已打包）
- `brand/` — Logo、favicon、品牌板
- `img/` — Unsplash 烘焙实景图（webp）
- `handoff/` — 验收截图

## 重新打包 WebGL

```bash
./node_modules/.bin/esbuild src/gl.js --bundle --minify --format=iife \
  --alias:three=./vendor/three.module.min.js --outfile=js/gl.bundle.js
```

## 说明

- 联系方式、地址、作品名称均为**示意占位**，对外发布前请替换。
- 支持 `prefers-reduced-motion` 与无 WebGL CSS 回退（实景英雄图）。
- 图片来源与致谢见 `CREDITS.md`。
