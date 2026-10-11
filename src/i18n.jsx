import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'loudnorm-web:lang'

const STRINGS = {
  zh: {
    title: 'Loudnorm Web',
    subtitle: '按行业标准把音频响度归一化 — 全部在浏览器本地完成，文件不会上传',
    dropzonePrompt: '点击选择或拖拽音频文件到此处',
    dropzoneSelected: (name) => `已选择：${name}`,
    presetLabel: '目标标准',
    measuring: (pct) => `正在测量响度… ${pct}%`,
    normalizeTo: (lufs) => `归一化到 ${lufs} LUFS`,
    processing: (pct) => `处理中… ${pct}%`,
    measurementHeading: '原始文件测量结果',
    resultHeading: '处理完成',
    integrated: 'Integrated Loudness',
    truePeak: 'True Peak',
    lra: 'Loudness Range',
    download: (name) => `下载 ${name}`,
    processAnother: '处理另一个文件',
    retry: '重试',
    unsupportedFile: (name) => `不支持的文件类型：${name}。请选择音频文件（mp3/wav/m4a/flac 等）。`,
    measureFailed: (msg) => `测量响度失败：${msg}`,
    normalizeFailed: (msg) => `归一化失败：${msg}`,
    footer: '基于 ffmpeg.wasm 在浏览器内运行 EBU R128 两遍响度归一化（loudnorm）。',
    sourceCode: '源码',
  },
  en: {
    title: 'Loudnorm Web',
    subtitle: 'Normalize audio loudness to industry standards — entirely in your browser, nothing is uploaded',
    dropzonePrompt: 'Click to choose or drag an audio file here',
    dropzoneSelected: (name) => `Selected: ${name}`,
    presetLabel: 'Target standard',
    measuring: (pct) => `Measuring loudness… ${pct}%`,
    normalizeTo: (lufs) => `Normalize to ${lufs} LUFS`,
    processing: (pct) => `Processing… ${pct}%`,
    measurementHeading: 'Source file measurement',
    resultHeading: 'Done',
    integrated: 'Integrated Loudness',
    truePeak: 'True Peak',
    lra: 'Loudness Range',
    download: (name) => `Download ${name}`,
    processAnother: 'Process another file',
    retry: 'Retry',
    unsupportedFile: (name) => `Unsupported file type: ${name}. Please choose an audio file (mp3/wav/m4a/flac, etc.).`,
    measureFailed: (msg) => `Failed to measure loudness: ${msg}`,
    normalizeFailed: (msg) => `Normalization failed: ${msg}`,
    footer: 'Runs EBU R128 two-pass loudness normalization (loudnorm) locally via ffmpeg.wasm.',
    sourceCode: 'Source',
  },
}

function detectDefaultLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') return stored
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to browser language
  }
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectDefaultLang)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore persistence failures
    }
  }, [lang])

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'zh' ? 'en' : 'zh'))
  }, [])

  const t = STRINGS[lang]

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
