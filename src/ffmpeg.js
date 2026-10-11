import { FFmpeg } from '@ffmpeg/ffmpeg'

let ffmpegInstance = null
let loadPromise = null

export function getFFmpeg(onLog) {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg()
  }
  if (onLog) {
    ffmpegInstance.off('log')
    ffmpegInstance.on('log', ({ message }) => onLog(message))
  }
  if (!loadPromise) {
    const base = `${import.meta.env.BASE_URL}ffmpeg-core`
    loadPromise = ffmpegInstance.load({
      coreURL: `${base}/ffmpeg-core.js`,
      wasmURL: `${base}/ffmpeg-core.wasm`,
    })
  }
  return loadPromise.then(() => ffmpegInstance)
}

const MEASURE_RE = {
  inputI: /Input Integrated:\s*(-?[\d.]+|-?inf)\s*LUFS/,
  inputTP: /Input True Peak:\s*(-?[\d.]+|-?inf)\s*dBTP/,
  inputLRA: /Input LRA:\s*(-?[\d.]+)\s*LU/,
  inputThresh: /Input Threshold:\s*(-?[\d.]+)\s*LUFS/,
}

function parseLoudnormJSON(logLines) {
  const text = logLines.join('\n')
  const start = text.lastIndexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

export async function measureLoudness(file, onProgress) {
  const ffmpeg = await getFFmpeg()
  const lines = []
  const logHandler = ({ message }) => lines.push(message)
  ffmpeg.on('log', logHandler)
  if (onProgress) {
    ffmpeg.off('progress')
    ffmpeg.on('progress', ({ progress }) => onProgress(Math.min(1, Math.max(0, progress))))
  }

  const inputName = 'measure_input' + extOf(file.name)
  await ffmpeg.writeFile(inputName, await fileToUint8Array(file))
  await ffmpeg.exec([
    '-i', inputName,
    '-af', 'loudnorm=print_format=json',
    '-f', 'null',
    '-',
  ])
  await ffmpeg.deleteFile(inputName)
  ffmpeg.off('log', logHandler)
  ffmpeg.off('progress')

  const json = parseLoudnormJSON(lines)
  if (json) {
    return {
      inputI: parseFloat(json.input_i),
      inputTP: parseFloat(json.input_tp),
      inputLRA: parseFloat(json.input_lra),
      inputThresh: parseFloat(json.input_thresh),
    }
  }
  // Fallback: regex over summary-style log lines
  const joined = lines.join('\n')
  const grab = (re) => {
    const m = joined.match(re)
    return m ? parseFloat(m[1]) : null
  }
  return {
    inputI: grab(MEASURE_RE.inputI),
    inputTP: grab(MEASURE_RE.inputTP),
    inputLRA: grab(MEASURE_RE.inputLRA),
    inputThresh: grab(MEASURE_RE.inputThresh),
  }
}

export async function normalizeLoudness(file, preset, measured, onProgress) {
  const ffmpeg = await getFFmpeg()
  if (onProgress) {
    ffmpeg.off('progress')
    ffmpeg.on('progress', ({ progress }) => onProgress(Math.min(1, Math.max(0, progress))))
  }

  const ext = extOf(file.name)
  const inputName = 'input' + ext
  const outputName = 'output.mp3'
  await ffmpeg.writeFile(inputName, await fileToUint8Array(file))

  const filter = [
    `loudnorm=I=${preset.I}:TP=${preset.TP}:LRA=${preset.LRA}`,
    `measured_I=${measured.inputI}`,
    `measured_TP=${measured.inputTP}`,
    `measured_LRA=${measured.inputLRA}`,
    `measured_thresh=${measured.inputThresh}`,
    'linear=true',
  ].join(':')

  await ffmpeg.exec([
    '-i', inputName,
    '-af', filter,
    '-ar', '48000',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    outputName,
  ])

  const data = await ffmpeg.readFile(outputName)
  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)
  ffmpeg.off('progress')

  return new Blob([data.buffer], { type: 'audio/mpeg' })
}

function extOf(name) {
  const i = name.lastIndexOf('.')
  return i === -1 ? '.dat' : name.slice(i)
}

async function fileToUint8Array(file) {
  const buf = await file.arrayBuffer()
  return new Uint8Array(buf)
}
