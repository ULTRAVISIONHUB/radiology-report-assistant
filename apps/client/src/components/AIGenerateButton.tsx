import { useState } from 'react'
import { Sparkles, Loader2, Bot, CheckCircle, AlertTriangle } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { generateReportFromImage, generateReportFromText, urlToBase64 } from '../services/gemini'

export function AIGenerateButton() {
  const {
    setReport,
    setStudy,
    currentReport,
    currentStudy,
    currentPatient,
    symptoms,
    clinicalSuspicions,
    roi,
    guidelines,
    uploadedFiles,
    roiBox,
    reportDraft,
  } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState('')

  const hasApiKey = !!localStorage.getItem('gemini_api_key')

  const parseAIReport = (text: string) => {
    const sections: Record<string, string> = {}
    const lines = text.split('\n')
    let currentSection = ''
    let currentContent: string[] = []

    for (const line of lines) {
      const sectionMatch = line.match(/^\*\*([^*]+)\*\*[:\s]*$/)
      if (sectionMatch) {
        if (currentSection) {
          sections[currentSection.toUpperCase()] = currentContent.join('\n').trim()
        }
        currentSection = sectionMatch[1].trim()
        currentContent = []
      } else if (currentSection && line.trim()) {
        currentContent.push(line)
      }
    }
    if (currentSection) {
      sections[currentSection.toUpperCase()] = currentContent.join('\n').trim()
    }
    return sections
  }

  const ensureStudyExists = () => {
    if (currentStudy) return currentStudy

    const studyId = crypto.randomUUID()
    const newStudy = {
      id: studyId,
      patientId: currentPatient?.id || 'unknown',
      modality: 'Unknown',
      studyDescription: currentPatient ? `Imaging study for ${currentPatient.name}` : 'Unspecified imaging study',
      studyDate: new Date().toISOString().split('T')[0],
      series: [],
      status: 'pending' as const,
      priority: 'routine' as const,
    }
    setStudy(newStudy)
    return newStudy
  }

  const handleGenerate = async () => {
    if (!currentPatient) {
      setError('Please fill in Patient details first (Patient tab).')
      return
    }

    if (!hasApiKey) {
      setError('No API key. Go to Settings to add your Gemini API key.')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGenerated(false)
    setError('')

    try {
      const study = ensureStudyExists()

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90))
      }, 300)

      let aiText = ''

      const imageFiles = uploadedFiles.filter((f) => f.type.startsWith('image/'))
      const hasImages = imageFiles.length > 0

      const patientContext = `Patient: ${currentPatient.name}, Age: ${currentPatient.age}, Sex: ${currentPatient.sex}`

      if (hasImages) {
        const allImages = await Promise.all(
          imageFiles.map(async (file) => {
            const base64 = await urlToBase64(file.url)
            return { base64, mimeType: file.type }
          })
        )
        aiText = await generateReportFromImage(
          allImages,
          reportDraft.clinicalIndication,
          reportDraft.clinicalHistory,
          patientContext,
          symptoms,
          clinicalSuspicions,
          roi,
          guidelines,
          roiBox,
          reportDraft.laterality,
          reportDraft.contrastUsed,
          reportDraft.imageQuality,
          reportDraft.bodyHabitus,
          reportDraft.pregnancyStatus,
          reportDraft.comorbidities,
          reportDraft.physicalExam,
          reportDraft.labValues
        )
      } else {
        aiText = await generateReportFromText(
          reportDraft.clinicalIndication,
          reportDraft.clinicalHistory,
          study.modality,
          study.studyDescription || 'Unknown',
          patientContext,
          symptoms,
          clinicalSuspicions,
          roi,
          guidelines,
          reportDraft.laterality,
          reportDraft.contrastUsed,
          reportDraft.imageQuality,
          reportDraft.bodyHabitus,
          reportDraft.pregnancyStatus,
          reportDraft.comorbidities,
          reportDraft.physicalExam,
          reportDraft.labValues
        )
      }

      clearInterval(progressInterval)
      setProgress(100)

      const sections = parseAIReport(aiText)

      const newReport = {
        id: currentReport?.id || crypto.randomUUID(),
        studyId: study.id,
        patientId: currentPatient.id,
        radiologistId: 'ai-assistant',
        radiologistName: 'AI Assistant (Gemini)',
        status: 'draft' as const,
        clinicalHistory: sections['CLINICAL HISTORY'] || reportDraft.clinicalHistory || '',
        clinicalIndication: sections['CLINICAL INDICATION'] || reportDraft.clinicalIndication || '',
        technique: sections['TECHNIQUE'] || reportDraft.technique || '',
        findings: sections['FINDINGS'] || aiText,
        impression: sections['IMPRESSION'] || reportDraft.impression || '',
        recommendations: sections['RECOMMENDATIONS'] || reportDraft.recommendations || '',
        criticalFindings: aiText.toLowerCase().includes('critical') || aiText.toLowerCase().includes('urgent'),
        createdAt: currentReport?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: (currentReport?.version || 0) + 1,
      }

      setReport(newReport)
      setIsGenerating(false)
      setGenerated(true)
      setTimeout(() => setGenerated(false), 3000)
    } catch (err: any) {
      setIsGenerating(false)
      setError(err.message || 'Failed to generate report')
    }
  }

  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-950/50 border border-indigo-800">
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-indigo-300">{progress}%</span>
      </div>
    )
  }

  if (generated) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs">
        <CheckCircle className="w-4 h-4" />
        Generated
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="max-w-[120px] truncate">{error}</span>
        </div>
      )}
      <button
        onClick={handleGenerate}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
          hasApiKey
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
        }`}
        title={hasApiKey ? 'Generate report with Gemini AI' : 'Add API key in Settings to enable AI'}
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI Generate
        <span className="ml-1 flex items-center gap-0.5 text-[10px] bg-black/20 px-1 py-0.5 rounded">
          <Bot className="w-3 h-3" />
          {hasApiKey ? 'Gemini' : 'Setup'}
        </span>
      </button>
    </div>
  )
}
