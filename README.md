# Loudnorm Web

按行业标准对音频文件进行响度归一化（LUFS normalization）的纯前端网页工具。基于 [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) 在浏览器本地运行 FFmpeg 的 `loudnorm`（EBU R128）滤镜，文件全程不离开本机，不上传任何服务器。

在线使用：https://Halinen.github.io/loudnorm-web/

## 功能

- 拖拽或选择音频文件，自动测量 Integrated Loudness / True Peak / LRA
- 按预设目标标准做两遍（two-pass）线性响度归一化
- 输出前再次测量，确认结果落在目标附近
- 直接在浏览器下载处理后的 MP3

## 预设标准

| 预设 | 目标响度 | 适用场景 |
|---|---|---|
| 播客 | -16 LUFS | Apple Podcasts / Spotify 等播客平台 |
| YouTube / 流媒体视频 | -14 LUFS | YouTube 等视频平台音频轨 |
| 广播 EBU R128 | -23 LUFS | 欧洲广播电视合规要求 |
| 美国广播 ATSC A/85 | -24 LKFS | 美国电视广播标准 |

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 技术说明

- `@ffmpeg/ffmpeg` + `@ffmpeg/core`（单线程版，非 `-mt`）：GitHub Pages 不发送 `SharedArrayBuffer` 所需的 COOP/COEP 响应头，单线程 core 不依赖这些头即可运行
- 两遍归一化：先用 `loudnorm=print_format=json` 测量真实响度/峰值/LRA，再把测量值传给第二遍 `loudnorm=...:linear=true` 做线性增益调整，避免动态压缩改变原始音频的强弱对比

## 许可

MIT
