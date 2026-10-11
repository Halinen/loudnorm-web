export const PRESETS = [
  {
    id: 'podcast',
    label: '播客 (Apple Podcasts / Spotify)',
    I: -16,
    TP: -1.5,
    LRA: 11,
    description: '-16 LUFS，访谈/播客类内容的通用交付标准',
  },
  {
    id: 'youtube',
    label: 'YouTube / 流媒体视频',
    I: -14,
    TP: -1,
    LRA: 11,
    description: '-14 LUFS，YouTube 等视频平台的音频轨标准',
  },
  {
    id: 'ebu',
    label: '广播 EBU R128',
    I: -23,
    TP: -1,
    LRA: 20,
    description: '-23 LUFS，欧洲广播电视合规标准',
  },
  {
    id: 'atsc',
    label: '美国广播 ATSC A/85',
    I: -24,
    TP: -2,
    LRA: 20,
    description: '-24 LKFS，美国电视广播标准',
  },
]
