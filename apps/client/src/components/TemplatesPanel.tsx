import { useState } from 'react'
import { Search, FileText, Plus, X, Check } from 'lucide-react'
import { useStore } from '../stores/useStore'
import type { ReportTemplate } from '../types'

const demoTemplates: ReportTemplate[] = [
  {
    id: 't1',
    name: 'Normal Chest CT',
    modality: 'CT',
    bodyPart: 'Chest',
    technique:
      'CT chest with IV contrast. Images acquired in helical mode with 1.25mm slice thickness.',
    normalFindings:
      'The lungs are clear without focal consolidation, pleural effusion, or pneumothorax. The mediastinum is unremarkable. No lymphadenopathy. Heart size is normal.',
    normalImpression: 'No acute cardiopulmonary abnormality.',
    sections: [],
  },
  {
    id: 't2',
    name: 'Normal Brain MRI',
    modality: 'MRI',
    bodyPart: 'Brain',
    technique:
      'MRI brain with and without gadolinium. Sequences include T1, T2, FLAIR, DWI, and ADC.',
    normalFindings:
      'Normal brain parenchyma without mass effect, midline shift, or abnormal signal. Ventricles are normal in size and configuration. No acute infarct or hemorrhage.',
    normalImpression: 'Normal MRI brain.',
    sections: [],
  },
  {
    id: 't3',
    name: 'Normal Abdominal US',
    modality: 'US',
    bodyPart: 'Abdomen',
    technique: 'Ultrasound of the abdomen with graded compression.',
    normalFindings:
      'Liver, gallbladder, pancreas, spleen, and kidneys are unremarkable. No free fluid. No biliary ductal dilation.',
    normalImpression: 'Normal abdominal ultrasound.',
    sections: [],
  },
  {
    id: 't4',
    name: 'PE Protocol CT',
    modality: 'CT',
    bodyPart: 'Chest',
    technique: 'CT pulmonary angiography with 80mL Omnipaque 350.',
    normalFindings: '',
    normalImpression: '',
    sections: [],
  },
  {
    id: 't5',
    name: 'Lumbar Spine MRI',
    modality: 'MRI',
    bodyPart: 'Spine',
    technique: 'MRI lumbar spine without contrast.',
    normalFindings: '',
    normalImpression: '',
    sections: [],
  },
]

const normalVariants = [
  'Normal study',
  'Age-appropriate changes',
  'No acute findings',
  'Stable compared to prior',
  'Within normal limits',
]

export function TemplatesPanel() {
  const { templates, setTemplates, setSelectedTemplate } = useStore()
  const [search, setSearch] = useState('')
  const [modalityFilter, setModalityFilter] = useState('')
  const [bodyPartFilter, setBodyPartFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null)

  const allTemplates = templates.length > 0 ? templates : demoTemplates

  const filtered = allTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesModality = !modalityFilter || t.modality === modalityFilter
    const matchesBodyPart = !bodyPartFilter || t.bodyPart.toLowerCase().includes(bodyPartFilter.toLowerCase())
    return matchesSearch && matchesModality && matchesBodyPart
  })

  const handleApply = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    // In real app, would populate report fields
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <FileText className="w-5 h-5 text-medical-400" />
        <h2 className="text-sm font-semibold text-slate-100">Report Templates</h2>
      </div>

      <div className="p-4 space-y-3">
        {/* Search & Filters */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-md bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 focus:outline-none"
          >
            <option value="">All Modalities</option>
            <option value="CT">CT</option>
            <option value="MRI">MRI</option>
            <option value="XR">X-Ray</option>
            <option value="US">US</option>
            <option value="NM">NM</option>
          </select>
          <input
            type="text"
            value={bodyPartFilter}
            onChange={(e) => setBodyPartFilter(e.target.value)}
            placeholder="Body part"
            className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
          />
        </div>

        {/* Normal variants quick-select */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Quick Variants</p>
          <div className="flex flex-wrap gap-1.5">
            {normalVariants.map((v) => (
              <button
                key={v}
                onClick={() => setSelectedTemplate({ id: 'quick', name: v, modality: '', bodyPart: '', technique: '', normalFindings: v, normalImpression: v, sections: [] })}
                className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-lg bg-slate-900 border border-slate-800 p-3 hover:border-medical-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-100">{t.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.modality}
                    </span>
                    <span className="text-[10px] text-slate-400">{t.bodyPart}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewTemplate(t)}
                    className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    title="Preview"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleApply(t)}
                    className="p-1 rounded text-medical-400 hover:text-medical-300 hover:bg-medical-950"
                    title="Apply"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">No templates match your filters.</p>
          )}
        </div>

        {/* Create template */}
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-medical-400 hover:text-medical-300 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          {showCreate ? 'Cancel' : 'Create Custom Template'}
        </button>

        {showCreate && (
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2">
            <input
              type="text"
              placeholder="Template name"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
            <textarea
              rows={3}
              placeholder="Template content..."
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500 resize-y"
            />
            <button className="w-full py-1.5 rounded-md bg-medical-600 text-white text-xs font-medium hover:bg-medical-500">
              Save Template
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">{previewTemplate.name}</h3>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 text-slate-400 hover:text-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs text-slate-300">
              <div>
                <p className="font-semibold text-slate-400 mb-1">Technique</p>
                <p className="bg-slate-800 rounded p-2">{previewTemplate.technique || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Findings</p>
                <p className="bg-slate-800 rounded p-2">{previewTemplate.normalFindings || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Impression</p>
                <p className="bg-slate-800 rounded p-2">{previewTemplate.normalImpression || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
