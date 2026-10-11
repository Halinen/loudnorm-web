# Loudnorm Web

按行业标准对音频文件进行响度归一化（LUFS normalization）的纯前端网页工具。基于 [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) 在浏览器本地运行 FFmpeg 的 `loudnorm`（EBU R128）滤镜，文件全程不离开本机，不上传任何服务器。

A browser-only tool for normalizing audio loudness (LUFS) to common industry targets. It runs FFmpeg's `loudnorm` (EBU R128) filter locally via [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) — your audio file never leaves your machine or touches a server.

在线使用 / Live demo：https://Halinen.github.io/loudnorm-web/

## 功能 / Features

- 拖拽或选择音频文件，自动测量 Integrated Loudness / True Peak / LRA
  Drag-and-drop or pick a file; Integrated Loudness, True Peak and LRA are measured automatically
- 按预设目标标准做两遍（two-pass）线性响度归一化
  Two-pass linear loudness normalization against a chosen preset target
- 输出前再次测量，确认结果落在目标附近
  Re-measures the output so you can confirm it landed near the target
- 直接在浏览器下载处理后的 MP3
  Download the processed MP3 directly from the browser
- 界面支持中英文切换，默认跟随浏览器语言
  UI supports Chinese/English toggle, defaulting to your browser's language

## 预设标准 / Presets

| 预设 / Preset | 目标响度 / Target | 适用场景 / Use case |
|---|---|---|
| 播客 / Podcast | -16 LUFS | Apple Podcasts / Spotify 等播客平台 — podcast platforms |
| YouTube / 流媒体视频 / Streaming video | -14 LUFS | YouTube 等视频平台音频轨 — video platform audio tracks |
| 广播 EBU R128 / Broadcast EBU R128 | -23 LUFS | 欧洲广播电视合规要求 — European broadcast compliance |
| 美国广播 ATSC A/85 / US broadcast ATSC A/85 | -24 LKFS | 美国电视广播标准 — US television broadcast standard |

## 本地开发 / Local development

```bash
npm install
npm run dev
```

## 构建 / Build

```bash
npm run build
npm run preview
```

## 技术说明 / Technical notes

- `@ffmpeg/ffmpeg` + `@ffmpeg/core`（单线程版，非 `-mt`）：GitHub Pages 不发送 `SharedArrayBuffer` 所需的 COOP/COEP 响应头，单线程 core 不依赖这些头即可运行
  Uses the single-threaded `@ffmpeg/core` build (not `-mt`) because GitHub Pages doesn't send the COOP/COEP headers `SharedArrayBuffer` requires — the single-threaded core works without them.
- 两遍归一化：先用 `loudnorm=print_format=json` 测量真实响度/峰值/LRA，再把测量值传给第二遍 `loudnorm=...:linear=true` 做线性增益调整，避免动态压缩改变原始音频的强弱对比
  Two-pass normalization: first `loudnorm=print_format=json` measures true loudness/peak/LRA, then those measured values feed a second `loudnorm=...:linear=true` pass that applies a linear gain adjustment, avoiding dynamic compression that would alter the original balance between loud and quiet passages.

## 许可 / License

MIT
