import {
  Move,
  ZoomIn,
  Contrast,
  Ruler,
  ArrowRight,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Sun,
  SunDim,
} from 'lucide-react'
import { useStore } from '../stores/useStore'

export function ToolBar() {
  const { activeTool, setActiveTool, zoom, setZoom, setWindowLevel, windowCenter, windowWidth, resetViewer } = useStore()

  const tools = [
    { id: 'pan' as const, icon: Move, label: 'Pan' },
    { id: 'zoom' as const, icon: ZoomIn, label: 'Zoom' },
    { id: 'window' as const, icon: Contrast, label: 'W/L' },
    { id: 'measure' as const, icon: Ruler, label: 'Measure' },
    { id: 'arrow' as const, icon: ArrowRight, label: 'Arrow' },
  ]

  const handleRotateCW = () => {
    // In a real app, would apply rotation transform
  }

  const handleFlipH = () => {
    // In a real app, would flip horizontally
  }

  const handleFlipV = () => {
    // In a real app, would flip vertically
  }

  const handleInvert = () => {
    setWindowLevel(255 - windowCenter, windowWidth)
  }

  return (
    <div className="flex flex-col items-center gap-1.5 py-2 px-1 bg-slate-900 border-r border-slate-800 h-full w-10 shrink-0">
      {tools.map((t) => {
        const Icon = t.icon
        const isActive = activeTool === t.id
        return (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-medical-600 text-white'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={t.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}

      <div className="w-6 h-px bg-slate-700 my-1" />

      <button
        onClick={() => setZoom(Math.min(10, zoom + 0.25))}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => setWindowLevel(windowCenter + 10, windowWidth)}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Increase Window Center"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setWindowLevel(windowCenter - 10, windowWidth)}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Decrease Window Center"
      >
        <SunDim className="w-4 h-4" />
      </button>

      <div className="w-6 h-px bg-slate-700 my-1" />

      <button
        onClick={handleInvert}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Invert"
      >
        <Contrast className="w-4 h-4" />
      </button>
      <button
        onClick={handleRotateCW}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Rotate CW"
      >
        <RotateCw className="w-4 h-4" />
      </button>
      <button
        onClick={handleFlipH}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Flip Horizontal"
      >
        <FlipHorizontal className="w-4 h-4" />
      </button>
      <button
        onClick={handleFlipV}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Flip Vertical"
      >
        <FlipVertical className="w-4 h-4" />
      </button>
      <button
        onClick={resetViewer}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        title="Reset View"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  )
}
