'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Sparkles, Image, Download, History, Zap } from 'lucide-react'
import { generateVideo } from '@/lib/api'

const STYLES = ['realista', 'animado', 'cinematográfico'] as const
const MAX_CREDITS = 10

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<string | null>(null) // base64
  const [style, setStyle] = useState<(typeof STYLES)[number]>('realista')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(MAX_CREDITS)
  const [history, setHistory] = useState<Array<{ videoUrl: string; prompt: string }>>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  })

  const handleGenerate = async () => {
    if (!prompt && !image) return alert('Escribe un prompt o sube una imagen')
    if (credits <= 0) return alert('Sin créditos, recarga la página')

    setLoading(true)
    try {
      const res = await generateVideo({ prompt, image, style })
      setVideoUrl(res.videoUrl)
      // Update history
      const newEntry = { videoUrl: res.videoUrl, prompt: res.prompt }
      setHistory(prev => [newEntry, ...prev].slice(0, 10))
      // Reduce credits
      setCredits(prev => prev - 1)
    } catch (err) {
      console.error(err)
      alert('Error al generar video')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!videoUrl) return
    // Intenta descargar con link directo
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = 'video-generado.mp4'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          AI Video Generator
        </h1>
        <p className="text-slate-300">Transforma palabras e imágenes en videos increíbles</p>
      </div>

      {/* Credit badge */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 bg-slate-700/70 backdrop-blur px-4 py-2 rounded-full">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium">{credits} créditos</span>
        </div>
      </div>

      {/* Main generator card */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda: inputs */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Prompt creativo</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ej: una rana arriba de una patineta en la ciudad, estilo animado"
                className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subir imagen (opcional)</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-purple-400 bg-purple-400/10' : 'border-slate-600 hover:border-slate-400'
                }`}
              >
                <input {...getInputProps()} />
                {image ? (
                  <div className="space-y-2">
                    <img src={image} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    <p className="text-xs text-slate-400">Haz clic o arrastra para cambiar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Image className="mx-auto w-8 h-8 text-slate-400" />
                    <p className="text-sm text-slate-300">
                      {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilo</label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value as typeof STYLES[number])}
                className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
              >
                {STYLES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || credits <= 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? 'Generando...' : 'Generar Video'}
            </button>
          </div>

          {/* Columna derecha: resultado */}
          <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-4 min-h-[300px] relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent" />
                <p className="text-slate-300 animate-pulse">Creando video...</p>
              </div>
            ) : videoUrl ? (
              <div className="space-y-4 w-full">
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg shadow-lg"
                  poster="/placeholder.jpg"
                />
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <Sparkles className="mx-auto w-12 h-12 mb-3 opacity-50" />
                <p>Tu video aparecerá aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historial */}
      {history.length > 0 && (
        <div className="bg-slate-800/40 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" /> Historial
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {history.map((entry, i) => (
              <div key={i} className="bg-slate-900/60 rounded-xl p-3 flex flex-col space-y-2">
                <video src={entry.videoUrl} className="w-full rounded" controls />
                <p className="text-xs text-slate-400 truncate">{entry.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}