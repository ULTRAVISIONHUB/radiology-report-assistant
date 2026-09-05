import { useState, useEffect } from 'react'
import {
  Save,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Clock,
  Check,
  Eye,
  EyeOff,
  FileText,
  RotateCcw,
  Plus,
} from 'lucide-react'
import { useStore } from '../stores/useStore'
import { AIGenerateButton } from './AIGenerateButton'

const symptomCategories = [
  {
    name: 'Respiratory',
    symptoms: ['Dyspnea', 'Cough', 'Hemoptysis', 'Wheezing', 'Chest Pain (Pleuritic)', 'Fever', 'Night Sweats'],
  },
  {
    name: 'Cardiovascular',
    symptoms: ['Chest Pain', 'Palpitations', 'Syncope', 'Edema', 'Hypertension', 'Claudication'],
  },
  {
    name: 'Neurological',
    symptoms: ['Headache', 'Seizures', 'Weakness', 'Numbness', 'Aphasia', 'Visual Changes', 'Dizziness'],
  },
  {
    name: 'GI',
    symptoms: ['Abdominal Pain', 'Nausea/Vomiting', 'GI Bleeding', 'Jaundice', 'Weight Loss'],
  },
  {
    name: 'MSK',
    symptoms: ['Joint Pain', 'Back Pain', 'Trauma History', 'Limited Range of Motion'],
  },
  {
    name: 'GU',
    symptoms: ['Hematuria', 'Dysuria', 'Flank Pain'],
  },
  {
    name: 'Constitutional',
    symptoms: ['Fatigue', 'Weight Loss', 'Fever', 'Chills', 'Night Sweats'],
  },
  {
    name: 'Other',
    symptoms: ['Lymphadenopathy', 'Rash', 'Paresthesia'],
  },
]

const clinicalSuspicionOptions = [
  'Primary Malignancy / Carcinoma',
  'Metastatic Disease (Secondary Lesions)',
  'Bacterial / Fungal Infection / Abscess',
  'Acute Ischemia / Infarct / Stroke',
  'Pulmonary Embolism / Thromboembolism',
  'Vascular Aneurysm / Dissection',
  'Interstitial Lung Disease / Fibrosis',
  'Traumatic Injury / Hemorrhage / Fracture',
  'Inflammatory / Autoimmune Disease',
  'Degenerative Disc / Joint Pathology',
  'Cystic / Benign Neoplasm',
  'Organ Perforation / Pneumoperitoneum',
]

const roiOptions = [
  'Whole Body / General Survey',
  'Brain (Cerebrum, Cerebellum, Brainstem)',
  'Head & Neck (Orbits, Sinuses, Neck Soft Tissues)',
  'Chest / Thorax (Lungs, Mediastinum, Pleura)',
  'Right Upper Lobe (Apical, Posterior, Anterior Segments)',
  'Right Middle Lobe (Lateral, Medial Segments)',
  'Right Lower Lobe (Superior, Medial Basal, Anterior Basal, Lateral Basal, Posterior Basal)',
  'Left Upper Lobe (Apicoposterior, Anterior, Superior Lingula, Inferior Lingula)',
  'Left Lower Lobe (Superior, Anteromedial Basal, Lateral Basal, Posterior Basal)',
  'Heart / Cardiac Chambers',
  'Abdomen (Liver, Gallbladder, Pancreas, Spleen)',
  'Kidneys / Adrenals / Ureters',
  'Pelvis (Bladder, Prostate, Uterus, Ovaries)',
  'Spine (Cervical, Thoracic, Lumbar, Sacral)',
  'Musculoskeletal (Shoulder, Elbow, Wrist, Hand, Hip, Knee, Ankle, Foot)',
  'Vascular (Aorta, Carotids, Pulmonary Arteries, Peripheral)',
]

const guidelineOptions = [
  'None',
  'Fleischner Society Guidelines (2024)',
  'ACR Appropriateness Criteria',
  'RECIST 1.1 (Response Evaluation Criteria)',
  'PI-RADS (Prostate)',
  'BI-RADS (Breast)',
  'LI-RADS (Liver)',
  'Lung-RADS',
  'C-RADS (Colorectal)',
  'NI-RADS (Neck)',
  'O-RADS (Ovary)',
  'TI-RADS (Thyroid)',
  'CAD-RADS (Coronary)',
  'Bosniak Classification (Renal Cysts)',
  'McDonald Criteria (Multiple Sclerosis)',
  'American College of Radiology White Paper',
  'Society of Interventional Radiology Guidelines',
  'Society of Nuclear Medicine Procedure Guidelines',
]

const lateralityOptions = ['Not Applicable', 'Left', 'Right', 'Bilateral', 'Midline']
const contrastOptions = ['None', 'IV Iodinated', 'Oral', 'Rectal', 'Gadolinium', 'Combined']
const imageQualityOptions = [
  'Excellent',
  'Good',
  'Adequate',
  'Suboptimal - Motion',
  'Suboptimal - Artifact',
  'Non-diagnostic',
]
const bodyHabitusOptions = ['Average', 'Obese', 'Underweight', 'Athletic', 'Limited mobility']
const pregnancyStatusOptions = [
  'Not Applicable',
  'Pre-menopausal Female - Not Pregnant',
  'Pregnant - 1st Trimester',
  'Pregnant - 2nd Trimester',
  'Pregnant - 3rd Trimester',
  'Post-partum',
  'Male/Post-menopausal',
]

export function ReportPanel() {
  const {
    currentUser,
    currentReport,
    currentPatient,
    currentStudy,
    saveReport,
    addToHistory,
    setReport,
    resetReportDraft,
    getPatientStudies,
    symptoms,
    setSymptoms,
    clinicalSuspicions,
    setClinicalSuspicions,
    roi,
    setRoi,
    guidelines,
    setGuidelines,
    reportDraft,
    setReportDraft,
  } = useStore()

  const [showVersions, setShowVersions] = useState(false)
  const [showSymptoms, setShowSymptoms] = useState(false)
  const [viewGenerated, setViewGenerated] = useState(false)

  const priorStudies = currentPatient
    ? getPatientStudies(currentPatient.id).filter((s) => s.id !== currentStudy?.id)
    : []

  // Auto-switch to view mode when AI generates report content
  useEffect(() => {
    if (currentReport?.findings || currentReport?.impression) {
      setViewGenerated(true)
    }
  }, [currentReport?.findings, currentReport?.impression])

  // Keep draft in sync with store's currentReport when AI generates
  useEffect(() => {
    if (currentReport) {
      const updates: Partial<typeof reportDraft> = {}
      if (currentReport.clinicalHistory) updates.clinicalHistory = currentReport.clinicalHistory
      if (currentReport.clinicalIndication) updates.clinicalIndication = currentReport.clinicalIndication
      if (currentReport.technique) updates.technique = currentReport.technique
      if (currentReport.findings) updates.findings = currentReport.findings
      if (currentReport.impression) updates.impression = currentReport.impression
      if (currentReport.recommendations) updates.recommendations = currentReport.recommendations
      if (currentReport.criticalFindings) updates.criticalFindings = currentReport.criticalFindings
      if (currentReport.comparisonStudyId) updates.comparisonStudyId = currentReport.comparisonStudyId
      if (currentReport.comparisonText) updates.comparisonText = currentReport.comparisonText
      setReportDraft(updates)
    }
  }, [currentReport])

  const isAttending = currentUser?.role === 'attending'
  const isAdmin = currentUser?.role === 'admin'
  const hasGeneratedContent = !!(currentReport?.findings || currentReport?.impression || currentReport?.clinicalHistory)

  const handleChange = (field: keyof typeof reportDraft, value: string | boolean) => {
    setReportDraft({ [field]: value } as Partial<typeof reportDraft>)
  }

  const handleSaveDraft = () => {
    if (!currentStudy || !currentPatient) return
    const newReport = {
      id: currentReport?.id || crypto.randomUUID(),
      studyId: currentStudy.id,
      patientId: currentPatient.id,
      radiologistId: currentUser!.id,
      radiologistName: currentUser!.name,
      status: 'draft' as const,
      clinicalHistory: reportDraft.clinicalHistory,
      clinicalIndication: reportDraft.clinicalIndication,
      technique: reportDraft.technique,
      findings: reportDraft.findings,
      impression: reportDraft.impression,
      recommendations: reportDraft.recommendations,
      criticalFindings: reportDraft.criticalFindings,
      criticalFindingsText: reportDraft.criticalFindings ? `Severity: ${reportDraft.criticalSeverity}` : undefined,
      comparisonStudyId: reportDraft.comparisonStudyId || undefined,
      comparisonText: reportDraft.comparisonText || undefined,
      createdAt: currentReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: currentReport?.version || 1,
    }
    saveReport(newReport)
    addToHistory(newReport)
  }

  const handleFinalize = () => {
    if (!isAttending && !isAdmin) return
    handleSaveDraft()
  }

  const handleNewReport = () => {
    if (window.confirm('Create a new report for this study? Previous report will be saved to history.')) {
      if (currentReport) addToHistory(currentReport)
      setReport(null)
      resetReportDraft()
      setViewGenerated(false)
    }
  }

  const statusOptions: { value: typeof reportDraft.status; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'bg-slate-600' },
    { value: 'preliminary', label: 'Preliminary', color: 'bg-amber-600' },
    { value: 'final', label: 'Final', color: 'bg-emerald-600' },
    { value: 'amended', label: 'Amended', color: 'bg-blue-600' },
  ]

  const toggleSymptom = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter((s) => s !== symptom))
    } else {
      setSymptoms([...symptoms, symptom])
    }
  }

  const toggleSuspicion = (suspicion: string) => {
    if (clinicalSuspicions.includes(suspicion)) {
      setClinicalSuspicions(clinicalSuspicions.filter((s) => s !== suspicion))
    } else if (clinicalSuspicions.length < 3) {
      setClinicalSuspicions([...clinicalSuspicions, suspicion])
    }
  }

  const TextArea = ({
    label,
    value,
    onChange,
    rows = 3,
    placeholder,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    rows?: number
    placeholder?: string
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 resize-y"
      />
    </div>
  )

  const SelectField = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: string[]
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <FileEdit className="w-5 h-5 text-medical-400" />
          <h2 className="text-sm font-semibold text-slate-100">Structured Report</h2>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${statusOptions.find((s) => s.value === reportDraft.status)?.color}`}>
            {statusOptions.find((s) => s.value === reportDraft.status)?.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AIGenerateButton />
          <button
            onClick={handleNewReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
            title="New Report"
          >
            <Plus className="w-3.5 h-3.5" />
            New Report
          </button>
          <div className="relative">
            <button
              onClick={() => setShowVersions((v) => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              <Clock className="w-3.5 h-3.5" />
              Versions
              <ChevronDown className="w-3 h-3" />
            </button>
            {showVersions && (
              <div className="absolute right-0 mt-1 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-xl z-30">
                <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">Version History</div>
                <div className="px-3 py-2 text-xs text-slate-500">No previous versions</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* GENERATED REPORT CARD - Prominent when content exists */}
        {hasGeneratedContent && (
          <div className="rounded-lg border border-medical-700 bg-medical-950/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-medical-900/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-medical-400" />
                <h3 className="text-sm font-semibold text-medical-100">Generated Report</h3>
              </div>
              <button
                onClick={() => setViewGenerated((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewGenerated
                    ? 'bg-medical-700 text-white hover:bg-medical-600'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {viewGenerated ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {viewGenerated ? 'Viewing Report' : 'Edit Report'}
              </button>
            </div>
            {viewGenerated && (
              <div className="p-4 space-y-4">
                {currentReport?.clinicalHistory && (
                  <div>
                    <h4 className="text-[10px] font-bold text-medical-400 uppercase tracking-wider mb-1">Clinical History</h4>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{currentReport.clinicalHistory}</p>
                  </div>
                )}
                {currentReport?.technique && (
                  <div>
                    <h4 className="text-[10px] font-bold text-medical-400 uppercase tracking-wider mb-1">Technique</h4>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{currentReport.technique}</p>
                  </div>
                )}
                {currentReport?.findings && (
                  <div>
                    <h4 className="text-[10px] font-bold text-medical-400 uppercase tracking-wider mb-1">Findings</h4>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{currentReport.findings}</p>
                  </div>
                )}
                {currentReport?.impression && (
                  <div className="rounded-md bg-emerald-950/20 border border-emerald-800/50 p-3">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Impression</h4>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{currentReport.impression}</p>
                  </div>
                )}
                {currentReport?.recommendations && (
                  <div>
                    <h4 className="text-[10px] font-bold text-medical-400 uppercase tracking-wider mb-1">Recommendations</h4>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{currentReport.recommendations}</p>
                  </div>
                )}
                <button
                  onClick={() => setViewGenerated(false)}
                  className="flex items-center gap-1.5 text-xs text-medical-400 hover:text-medical-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Switch to Edit Mode to modify
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section A: Symptom Checklist */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => setShowSymptoms((s) => !s)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Symptom Checklist</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">41 Curated Clinical Indicator Markers</p>
            </div>
            {showSymptoms ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showSymptoms && (
            <div className="px-4 pb-4 space-y-3">
              {symptomCategories.map((cat) => (
                <div key={cat.name}>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{cat.name}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cat.symptoms.map((symptom) => (
                      <label key={symptom} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={symptoms.includes(symptom)}
                          onChange={() => toggleSymptom(symptom)}
                          className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-medical-500 focus:ring-medical-500"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {symptoms.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-medical-900/50 text-medical-300 border border-medical-800">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section B: Clinical Suspicion */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Modality Focus Mode & Diagnostic Search-Space Narrowing</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Constrains differential spectrum, targets anatomical ROIs, and applies strict clinical guidelines
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">Clinical Suspicion (Pick up to 3)</label>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                clinicalSuspicions.length === 3 ? 'bg-amber-900/50 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {clinicalSuspicions.length} / 3 Selected
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {clinicalSuspicionOptions.map((option) => {
                const isSelected = clinicalSuspicions.includes(option)
                return (
                  <button
                    key={option}
                    onClick={() => toggleSuspicion(option)}
                    disabled={!isSelected && clinicalSuspicions.length >= 3}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-medical-600 border-medical-500 text-white'
                        : clinicalSuspicions.length >= 3
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Section C: ROI Focus & Guidelines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Region of Interest (ROI) Focus</label>
            <select
              value={roi}
              onChange={(e) => setRoi(e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
            >
              <option value="">Select anatomical region...</option>
              {roiOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Clinical & Radiology Guidelines Selector</label>
            <select
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
            >
              {guidelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section D: Report Content - only show edit form when not viewing generated */}
        {!viewGenerated && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Report Content</h3>
              {hasGeneratedContent && (
                <button
                  onClick={() => setViewGenerated(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-medical-700 text-white hover:bg-medical-600 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Generated Report
                </button>
              )}
            </div>

            {/* Status + Critical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Report Status</label>
                <select
                  value={reportDraft.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportDraft.criticalFindings}
                    onChange={(e) => handleChange('criticalFindings', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Critical Findings
                  </span>
                </label>
                {reportDraft.criticalFindings && (
                  <select
                    value={reportDraft.criticalSeverity}
                    onChange={(e) => handleChange('criticalSeverity', e.target.value)}
                    className="rounded-md bg-red-950/50 border border-red-800 px-2 py-1 text-xs text-red-300"
                  >
                    <option value="critical">Critical</option>
                    <option value="urgent">Urgent</option>
                    <option value="unexpected">Unexpected</option>
                  </select>
                )}
              </div>
            </div>

            {/* Comparison */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Comparison with Prior Study</label>
              <div className="flex gap-2">
                <select
                  value={reportDraft.comparisonStudyId}
                  onChange={(e) => {
                    const studyId = e.target.value
                    const study = priorStudies.find((s) => s.id === studyId)
                    const dateStr = study?.studyDate ? new Date(study.studyDate).toLocaleDateString() : ''
                    const text = study ? `Compared with prior ${study.modality} from ${dateStr}:` : ''
                    setReportDraft({ comparisonStudyId: studyId, comparisonText: text })
                  }}
                  className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
                >
                  <option value="">Select prior study...</option>
                  {priorStudies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studyDate ? new Date(s.studyDate).toLocaleDateString() : 'Unknown date'} — {s.modality} — {s.studyDescription}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={reportDraft.comparisonText}
                  onChange={(e) => handleChange('comparisonText', e.target.value)}
                  placeholder="Comparison notes"
                  className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
                />
              </div>
            </div>

            {/* Patient Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Body Habitus"
                value={reportDraft.bodyHabitus}
                onChange={(v) => handleChange('bodyHabitus', v)}
                options={bodyHabitusOptions}
              />
              <SelectField
                label="Pregnancy Status"
                value={reportDraft.pregnancyStatus}
                onChange={(v) => handleChange('pregnancyStatus', v)}
                options={pregnancyStatusOptions}
              />
            </div>

            <TextArea
              label="Comorbidities"
              value={reportDraft.comorbidities}
              onChange={(v) => handleChange('comorbidities', v)}
              placeholder="List relevant comorbidities (e.g., diabetes, hypertension, COPD)..."
            />
            <TextArea
              label="Physical Exam Findings"
              value={reportDraft.physicalExam}
              onChange={(v) => handleChange('physicalExam', v)}
              placeholder="Relevant physical examination findings..."
            />
            <TextArea
              label="Relevant Lab Values"
              value={reportDraft.labValues}
              onChange={(v) => handleChange('labValues', v)}
              placeholder="Recent lab values pertinent to this study..."
            />

            <TextArea
              label="Clinical History"
              value={reportDraft.clinicalHistory}
              onChange={(v) => handleChange('clinicalHistory', v)}
              placeholder="Patient's clinical history..."
            />
            <TextArea
              label="Clinical Indication"
              value={reportDraft.clinicalIndication}
              onChange={(v) => handleChange('clinicalIndication', v)}
              placeholder="Reason for imaging study..."
            />
            <TextArea
              label="Technique"
              value={reportDraft.technique}
              onChange={(v) => handleChange('technique', v)}
              placeholder="Imaging technique and parameters..."
            />

            {/* Imaging Context */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField
                label="Laterality"
                value={reportDraft.laterality}
                onChange={(v) => handleChange('laterality', v)}
                options={lateralityOptions}
              />
              <SelectField
                label="Contrast Used"
                value={reportDraft.contrastUsed}
                onChange={(v) => handleChange('contrastUsed', v)}
                options={contrastOptions}
              />
              <SelectField
                label="Image Quality"
                value={reportDraft.imageQuality}
                onChange={(v) => handleChange('imageQuality', v)}
                options={imageQualityOptions}
              />
            </div>

            <TextArea
              label="Findings"
              value={reportDraft.findings}
              onChange={(v) => handleChange('findings', v)}
              rows={6}
              placeholder="Detailed imaging findings..."
            />
            <TextArea
              label="Impression"
              value={reportDraft.impression}
              onChange={(v) => handleChange('impression', v)}
              rows={4}
              placeholder="Overall impression / conclusion..."
            />
            <TextArea
              label="Recommendations"
              value={reportDraft.recommendations}
              onChange={(v) => handleChange('recommendations', v)}
              rows={3}
              placeholder="Follow-up recommendations..."
            />

            {/* Amended info (read-only) */}
            {currentReport?.amendedAt && (
              <div className="rounded-md bg-blue-950/30 border border-blue-800 px-3 py-2 text-xs text-blue-300">
                <p>Amended by: {currentReport.amendedBy}</p>
                <p>Date: {new Date(currentReport.amendedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900">
        <div className="text-xs text-slate-500">
          {currentReport && (
            <span>
              Last saved: {new Date(currentReport.updatedAt).toLocaleTimeString()} · v{currentReport.version}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>
          {(isAttending || isAdmin) && (
            <button
              onClick={handleFinalize}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Finalize Report
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
