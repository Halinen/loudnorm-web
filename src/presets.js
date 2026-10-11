export const PRESETS = [
  {
    id: 'podcast',
    I: -16,
    TP: -1.5,
    LRA: 11,
    label: { zh: '播客 (Apple Podcasts / Spotify)', en: 'Podcast (Apple Podcasts / Spotify)' },
    description: {
      zh: '-16 LUFS，访谈/播客类内容的通用交付标准',
      en: '-16 LUFS, the common delivery standard for talk/podcast content',
    },
  },
  {
    id: 'youtube',
    I: -14,
    TP: -1,
    LRA: 11,
    label: { zh: 'YouTube / 流媒体视频', en: 'YouTube / Streaming video' },
    description: {
      zh: '-14 LUFS，YouTube 等视频平台的音频轨标准',
      en: '-14 LUFS, the audio track standard used by YouTube and similar platforms',
    },
  },
  {
    id: 'ebu',
    I: -23,
    TP: -1,
    LRA: 20,
    label: { zh: '广播 EBU R128', en: 'Broadcast EBU R128' },
    description: {
      zh: '-23 LUFS，欧洲广播电视合规标准',
      en: '-23 LUFS, the European broadcast compliance standard',
    },
  },
  {
    id: 'atsc',
    I: -24,
    TP: -2,
    LRA: 20,
    label: { zh: '美国广播 ATSC A/85', en: 'US broadcast ATSC A/85' },
    description: {
      zh: '-24 LKFS，美国电视广播标准',
      en: '-24 LKFS, the US television broadcast standard',
    },
  },
]
