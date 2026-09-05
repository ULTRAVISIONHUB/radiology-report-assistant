import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Move,
  ZoomIn,
  Contrast,
  Ruler,
  ArrowRight,
  RotateCcw,
  Maximize,
  Upload,
  X,
  Film,
  Square,
} from 'lucide-react'
import { useStore } from '../stores/useStore'

interface LocalUploadedFile {
  id: string
  file: File
  url: string
  type: 'image' | 'video'
  name: string
  size: number
}

const MAX_FILES = 50
const ACCEPTED_TYPES = 'image/*,video/*'

export function ImageViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const roiStartRef = useRef({ x: 0, y: 0 })
  const {
    currentPatient,
    selectedInstanceId,
    zoom,
    pan,
    windowCenter,
    windowWidth,
    activeTool,
    measurements,
    roiBox,
    setZoom,
    setPan,
    setWindowLevel,
    setActiveTool,
    addMeasurement,
    resetViewer,
    setSelectedInstance,
    setUploadedFiles,
    setRoiBox,
  } = useStore()

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [localFiles, setLocalFiles] = useState<LocalUploadedFile[]>([])
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeFileIndex, setActiveFileIndex] = useState(0)

  // ROI drawing state
  const [isDrawingRoi, setIsDrawingRoi] = useState(false)

  // Load image onto canvas
  const loadImageToCanvas = useCallback((url: string) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setCurrentImage(img)
      setImageLoaded(true)
      drawImage(img)
    }
    img.src = url
  }, [])

  const drawImage = useCallback((img: HTMLImageElement | null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    if (img) {
      const scale = Math.min(w / img.width, h / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = (w - dw) / 2
      const dy = (h - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)
    } else {
      drawDemoPattern(ctx, w, h)
    }

    // Draw measurements
    measurements.forEach((m) => {
      if (m.points.length >= 2) {
        ctx.strokeStyle = '#22d3ee'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(m.points[0].x, m.points[0].y)
        ctx.lineTo(m.points[1].x, m.points[1].y)
        ctx.stroke()
        ctx.fillStyle = '#22d3ee'
        ctx.font = '12px monospace'
        ctx.fillText(`${m.value.toFixed(1)} ${m.unit}`, m.points[1].x + 5, m.points[1].y)
      }
    })

    // Draw ROI box
    if (roiBox) {
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(roiBox.x, roiBox.y, roiBox.w, roiBox.h)
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'
      ctx.fillRect(roiBox.x, roiBox.y, roiBox.w, roiBox.h)

      ctx.fillStyle = '#06b6d4'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`ROI ${Math.abs(Math.round(roiBox.w))}x${Math.abs(Math.round(roiBox.h))}`, roiBox.x + 2, roiBox.y - 4)
    }
  }, [measurements, roiBox])

  const drawDemoPattern = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const imageData = ctx.createImageData(w, h)
    const data = imageData.data

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const dx = x - w / 2
        const dy = y - h / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        let val = 30 + Math.random() * 20

        if (dist < w * 0.35) {
          val = 80 + Math.random() * 60
          if (Math.abs(dx) < 12 && dy < 0) val = 180 + Math.random() * 40
          const rib = Math.sin(dy * 0.08) * 80
          if (Math.abs(Math.abs(dx) - rib) < 8 && Math.abs(dy) < h * 0.3) {
            val = 200 + Math.random() * 30
          }
        }

        const min = windowCenter - windowWidth / 2
        const max = windowCenter + windowWidth / 2
        let display = ((val - min) / (max - min)) * 255
        display = Math.max(0, Math.min(255, display))

        data[idx] = display
        data[idx + 1] = display
        data[idx + 2] = display
        data[idx + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    if (currentImage) {
      drawImage(currentImage)
    } else {
      drawImage(null)
    }
  }, [currentImage, drawImage])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      if (currentImage) {
        drawImage(currentImage)
      } else {
        drawImage(null)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentImage, drawImage])

  // Sync local files to store
  useEffect(() => {
    const storeFiles = localFiles.map((f) => ({ id: f.id, url: f.url, type: f.type, name: f.name }))
    setUploadedFiles(storeFiles)
  }, [localFiles, setUploadedFiles])

  // Handle file upload
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newFiles: LocalUploadedFile[] = []
    const remainingSlots = MAX_FILES - localFiles.length

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        newFiles.push({
          id: crypto.randomUUID(),
          file,
          url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name,
          size: file.size,
        })
      }
    })

    if (newFiles.length > 0) {
      setLocalFiles((prev) => [...prev, ...newFiles])
      const firstNew = newFiles[0]
      if (firstNew.type === 'image') {
        loadImageToCanvas(firstNew.url)
        setActiveFileIndex(localFiles.length)
        setSelectedInstance(firstNew.id)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const selectFile = (file: LocalUploadedFile, index: number) => {
    setActiveFileIndex(index)
    setSelectedInstance(file.id)
    if (file.type === 'image') {
      loadImageToCanvas(file.url)
    } else {
      setCurrentImage(null)
      setImageLoaded(false)
    }
  }

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const file = localFiles[index]
    URL.revokeObjectURL(file.url)

    const newLocalFiles = localFiles.filter((_, i) => i !== index)
    setLocalFiles(newLocalFiles)

    if (activeFileIndex === index) {
      if (newLocalFiles.length > 0) {
        const newIndex = Math.max(0, index - 1)
        setActiveFileIndex(newIndex)
        selectFile(newLocalFiles[newIndex], newIndex)
      } else {
        setActiveFileIndex(0)
        setCurrentImage(null)
        setImageLoaded(false)
        setSelectedInstance(null)
      }
    } else if (activeFileIndex > index) {
      setActiveFileIndex(activeFileIndex - 1)
    }
  }

  const getCanvasPoint = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / zoom - pan.x,
      y: (e.clientY - rect.top) / zoom - pan.y,
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'roi') {
      const pt = getCanvasPoint(e)
      roiStartRef.current = pt
      setIsDrawingRoi(true)
      return
    }
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeTool === 'roi' && isDrawingRoi) {
      const pt = getCanvasPoint(e)
      if (currentImage) drawImage(currentImage)
      else drawImage(null)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const rw = pt.x - roiStartRef.current.x
          const rh = pt.y - roiStartRef.current.y
          ctx.strokeStyle = '#06b6d4'
          ctx.lineWidth = 2
          ctx.setLineDash([3, 3])
          ctx.strokeRect(roiStartRef.current.x, roiStartRef.current.y, rw, rh)
          ctx.setLineDash([])
          ctx.fillStyle = 'rgba(6, 182, 212, 0.1)'
          ctx.fillRect(roiStartRef.current.x, roiStartRef.current.y, rw, rh)
        }
      }
      return
    }

    if (!isDragging) return
    const dx = (e.clientX - dragStart.x) / zoom
    const dy = (e.clientY - dragStart.y) / zoom

    if (activeTool === 'pan') {
      setPan({ x: pan.x + dx, y: pan.y + dy })
    } else if (activeTool === 'window') {
      setWindowLevel(windowCenter + dx * 0.5, Math.max(1, windowWidth + dy))
    }

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (activeTool === 'roi' && isDrawingRoi) {
      setIsDrawingRoi(false)
      const pt = getCanvasPoint(e)
      const w = pt.x - roiStartRef.current.x
      const h = pt.y - roiStartRef.current.y
      if (Math.abs(w) > 5 && Math.abs(h) > 5) {
        setRoiBox({
          x: roiStartRef.current.x,
          y: roiStartRef.current.y,
          w,
          h,
        })
      }
      return
    }

    if (!isDragging) return
    setIsDragging(false)

    if (activeTool === 'measure') {
      const pt = getCanvasPoint(e)
      addMeasurement({
        id: crypto.randomUUID(),
        instanceId: selectedInstanceId || 'demo',
        type: 'length',
        points: [{ x: pt.x - 50, y: pt.y }, { x: pt.x + 50, y: pt.y }],
        value: 42.5,
        unit: 'mm',
        label: 'Measurement',
      })
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const newZoom = Math.max(0.1, Math.min(10, zoom - e.deltaY * 0.001))
    setZoom(newZoom)
  }

  const tools = [
    { id: 'pan' as const, icon: Move, label: 'Pan' },
    { id: 'zoom' as const, icon: ZoomIn, label: 'Zoom' },
    { id: 'window' as const, icon: Contrast, label: 'Window/Level' },
    { id: 'measure' as const, icon: Ruler, label: 'Measure' },
    { id: 'arrow' as const, icon: ArrowRight, label: 'Arrow' },
    { id: 'roi' as const, icon: Square, label: 'ROI' },
  ]

  const currentFile = localFiles[activeFileIndex]

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-900 border-b border-slate-800">
        {tools.map((t) => {
          const Icon = t.icon
          const isActive = activeTool === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-medical-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
              title={t.label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
        <div className="w-px h-6 bg-slate-700 mx-1" />
        <button
          onClick={resetViewer}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          title="Fit to Window"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-6 bg-slate-700 mx-1" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-medical-700 hover:bg-medical-600 text-white transition-colors"
          title="Upload Images/Videos"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <span className="text-[10px] text-slate-500 ml-1">
          {localFiles.length}/{MAX_FILES}
        </span>
      </div>

      {/* Viewer area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-50 bg-medical-900/80 border-2 border-dashed border-medical-400 flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-12 h-12 text-medical-300 mx-auto mb-2" />
              <p className="text-medical-100 font-medium">Drop images or videos here</p>
              <p className="text-medical-300 text-sm">Up to {MAX_FILES} files</p>
            </div>
          </div>
        )}

        {currentFile?.type === 'video' ? (
          <video
            src={currentFile.url}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDragging(false)
              if (isDrawingRoi) {
                setIsDrawingRoi(false)
                if (currentImage) drawImage(currentImage)
                else drawImage(null)
              }
            }}
            onWheel={handleWheel}
            className="absolute inset-0 cursor-crosshair"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />
        )}

        {/* Patient info overlay */}
        {currentPatient && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-slate-200 pointer-events-none">
            <p className="font-semibold">{currentPatient.name}</p>
            <p className="text-slate-400">MRN: {currentPatient.mrn}</p>
            <p className="text-slate-400">
              {currentPatient.dateOfBirth} · {currentFile?.name || 'No file'}
            </p>
          </div>
        )}

        {/* Window/Level overlay */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-slate-200 pointer-events-none">
          <p className="text-slate-400">WC: <span className="text-slate-100 font-mono">{Math.round(windowCenter)}</span></p>
          <p className="text-slate-400">WW: <span className="text-slate-100 font-mono">{Math.round(windowWidth)}</span></p>
          <p className="text-slate-400">Zoom: <span className="text-slate-100 font-mono">{zoom.toFixed(2)}x</span></p>
        </div>

        {/* ROI info overlay */}
        {roiBox && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-cyan-200 pointer-events-none">
            <p className="font-semibold text-cyan-300">ROI Active</p>
            <p className="text-slate-400">x: {Math.round(roiBox.x)}, y: {Math.round(roiBox.y)}</p>
            <p className="text-slate-400">w: {Math.round(Math.abs(roiBox.w))}, h: {Math.round(Math.abs(roiBox.h))}</p>
          </div>
        )}

        {/* Measurement sidebar */}
        {measurements.length > 0 && (
          <div className="absolute right-3 top-24 bg-black/70 backdrop-blur-sm rounded-md p-2 text-xs text-slate-200 max-w-[140px]">
            <p className="font-semibold text-slate-300 mb-1">Measurements</p>
            {measurements.map((m) => (
              <div key={m.id} className="flex justify-between py-0.5 border-b border-slate-700 last:border-0">
                <span className="text-slate-400">{m.label}</span>
                <span className="font-mono text-cyan-400">{m.value.toFixed(1)} {m.unit}</span>
              </div>
            ))}
          </div>
        )}

        {!imageLoaded && localFiles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-sm mb-2">Drag & drop images or videos here</p>
              <p className="text-slate-600 text-xs">or click the Upload button above</p>
              <p className="text-slate-600 text-xs mt-1">Supports up to {MAX_FILES} files</p>
            </div>
          </div>
        )}
      </div>

      {/* Series tray */}
      <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center px-2 gap-2 overflow-x-auto">
        {localFiles.length === 0 ? (
          <div className="flex items-center justify-center w-full text-slate-600 text-xs">
            No media uploaded
          </div>
        ) : (
          localFiles.map((file, index) => (
            <button
              key={file.id}
              onClick={() => selectFile(file, index)}
              className={`relative flex-shrink-0 w-20 h-18 rounded border-2 transition-all group ${
                activeFileIndex === index
                  ? 'border-medical-500 ring-1 ring-medical-500/30'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              {file.type === 'image' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 rounded flex items-center justify-center">
                  <Film className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-slate-300 text-center truncate px-1">
                {file.name.length > 12 ? file.name.substring(0, 12) + '...' : file.name}
              </span>
              <button
                onClick={(e) => removeFile(index, e)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-900/80 text-red-300 hover:bg-red-800 hover:text-red-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
