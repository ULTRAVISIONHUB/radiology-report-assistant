import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Globe, Send, X } from 'lucide-react'
import { useStore } from '../stores/useStore'

const languages = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'ar-SA', label: 'Arabic' },
]

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
    SpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export function VoiceDictation() {
  const { voiceState, setVoiceState } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState('en-US')
  const [error, setError] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const time = Date.now() / 200

    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 2

    ctx.beginPath()
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin(x * 0.05 + time) * 15 + Math.sin(x * 0.1 - time * 2) * 8
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    animRef.current = requestAnimationFrame(drawWaveform)
  }, [])

  useEffect(() => {
    if (voiceState.isListening) {
      animRef.current = requestAnimationFrame(drawWaveform)
    } else {
      cancelAnimationFrame(animRef.current)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [voiceState.isListening, drawWaveform])

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.')
      return
    }

    setError('')
    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setVoiceState({
        transcript: voiceState.transcript + finalTranscript,
        interimTranscript,
      })
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Error: ${event.error}`)
      setVoiceState({ isListening: false })
    }

    recognition.onend = () => {
      setVoiceState({ isListening: false })
    }

    recognitionRef.current = recognition
    recognition.start()
    setVoiceState({ isListening: true })
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setVoiceState({ isListening: false })
  }

  const toggleListening = () => {
    if (voiceState.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const insertTranscript = () => {
    const text = voiceState.transcript.trim()
    if (!text) return
    // In a real app, this would insert at cursor in the active textarea
    // For demo, we show it was inserted
    setVoiceState({ transcript: '', interimTranscript: '' })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-medical-600 text-white shadow-lg hover:bg-medical-500 transition-colors flex items-center justify-center"
        title="Voice Dictation"
      >
        <Mic className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-medical-400" />
          <span className="text-xs font-semibold text-slate-200">Voice Dictation</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-100">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Waveform */}
      <div className="h-12 bg-slate-950 flex items-center justify-center">
        <canvas ref={canvasRef} width={280} height={48} className="w-full h-full" />
      </div>

      {/* Language */}
      <div className="px-3 py-2 flex items-center gap-2 border-b border-slate-800">
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-medical-500"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Transcript */}
      <div className="px-3 py-2 min-h-[60px] max-h-32 overflow-y-auto">
        <p className="text-sm text-slate-200 whitespace-pre-wrap">{voiceState.transcript}</p>
        {voiceState.interimTranscript && (
          <p className="text-sm text-slate-500 italic">{voiceState.interimTranscript}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-1.5 bg-red-950/50 border-t border-red-900 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-800">
        <button
          onClick={toggleListening}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${
            voiceState.isListening
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'bg-medical-600 text-white hover:bg-medical-500'
          }`}
        >
          {voiceState.isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {voiceState.isListening ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={insertTranscript}
          disabled={!voiceState.transcript.trim()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          Insert
        </button>
      </div>
    </div>
  )
}
