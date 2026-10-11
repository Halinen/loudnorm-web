import { useCallback, useRef, useState } from 'react'
import { PRESETS } from './presets'
import { measureLoudness, normalizeLoudness } from './ffmpeg'
import './App.css'

const STAGE = {
  IDLE: 'idle',
  MEASURING: 'measuring',
  MEASURED: 'measured',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
}

function fmt(n) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(1) : '—'
}

export default function App() {
  const [file, setFile] = useState(null)
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const [stage, setStage] = useState(STAGE.IDLE)
  const [measured, setMeasured] = useState(null)
  const [resultBlob, setResultBlob] = useState(null)
  const [resultMeasured, setResultMeasured] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const preset = PRESETS.find((p) => p.id === presetId)

  const reset = useCallback(() => {
    setStage(STAGE.IDLE)
    setMeasured(null)
    setResultBlob(null)
    setResultMeasured(null)
    setProgress(0)
    setError(null)
  }, [])

  const handleFile = useCallback(async (f) => {
    if (!f) return
    reset()
    setFile(f)
    setStage(STAGE.MEASURING)
    try {
      const m = await measureLoudness(f)
      setMeasured(m)
      setStage(STAGE.MEASURED)
    } catch (e) {
      setError(String(e?.message || e))
      setStage(STAGE.ERROR)
    }
  }, [reset])

  const handleNormalize = useCallback(async () => {
    if (!file || !measured) return
    setStage(STAGE.PROCESSING)
    setProgress(0)
    setError(null)
    try {
      const blob = await normalizeLoudness(file, preset, measured, setProgress)
      setResultBlob(blob)
      const resultFile = new File([blob], 'normalized.mp3', { type: 'audio/mpeg' })
      const rm = await measureLoudness(resultFile)
      setResultMeasured(rm)
      setStage(STAGE.DONE)
    } catch (e) {
      setError(String(e?.message || e))
      setStage(STAGE.ERROR)
    }
  }, [file, measured, preset])

  const downloadUrl = resultBlob ? URL.createObjectURL(resultBlob) : null
  const downloadName = file ? file.name.replace(/\.[^.]+$/, '') + '_norm.mp3' : 'normalized.mp3'

  return (
    <div className="app">
      <header>
        <h1>Loudnorm Web</h1>
        <p className="subtitle">按行业标准把音频响度归一化 — 全部在浏览器本地完成，文件不会上传</p>
      </header>

      <section
        className={`dropzone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <p>已选择：<strong>{file.name}</strong></p>
        ) : (
          <p>点击选择或拖拽音频文件到此处</p>
        )}
      </section>

      <section className="presets">
        <label htmlFor="preset-select">目标标准</label>
        <select id="preset-select" value={presetId} onChange={(e) => setPresetId(e.target.value)}>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <p className="preset-desc">{preset.description}</p>
      </section>

      {stage === STAGE.MEASURING && <p className="status">正在测量响度…</p>}

      {measured && (stage === STAGE.MEASURED || stage === STAGE.PROCESSING || stage === STAGE.DONE) && (
        <section className="measurement">
          <h2>原始文件测量结果</h2>
          <dl>
            <dt>Integrated Loudness</dt><dd>{fmt(measured.inputI)} LUFS</dd>
            <dt>True Peak</dt><dd>{fmt(measured.inputTP)} dBTP</dd>
            <dt>Loudness Range</dt><dd>{fmt(measured.inputLRA)} LU</dd>
          </dl>
        </section>
      )}

      {stage === STAGE.MEASURED && (
        <button className="primary" onClick={handleNormalize}>
          归一化到 {preset.I} LUFS
        </button>
      )}

      {stage === STAGE.PROCESSING && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${Math.round(progress * 100)}%` }} />
          <span>处理中… {Math.round(progress * 100)}%</span>
        </div>
      )}

      {stage === STAGE.DONE && resultMeasured && (
        <section className="result">
          <h2>处理完成</h2>
          <dl>
            <dt>Integrated Loudness</dt><dd>{fmt(resultMeasured.inputI)} LUFS</dd>
            <dt>True Peak</dt><dd>{fmt(resultMeasured.inputTP)} dBTP</dd>
            <dt>Loudness Range</dt><dd>{fmt(resultMeasured.inputLRA)} LU</dd>
          </dl>
          <a className="primary download" href={downloadUrl} download={downloadName}>
            下载 {downloadName}
          </a>
          <button className="secondary" onClick={reset}>处理另一个文件</button>
        </section>
      )}

      {stage === STAGE.ERROR && (
        <section className="error">
          <p>处理失败：{error}</p>
          <button className="secondary" onClick={reset}>重试</button>
        </section>
      )}

      <footer>
        <p>
          基于 ffmpeg.wasm 在浏览器内运行 EBU R128 两遍响度归一化（loudnorm）。
          源码：<a href="https://github.com/Halinen/loudnorm-web" target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </footer>
    </div>
  )
}
