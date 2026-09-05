import { useState } from 'react'
import { History, RotateCcw, GitCompare, X } from 'lucide-react'
import { useStore } from '../stores/useStore'
import type { Report } from '../types'

const demoHistory: Report[] = [
  {
    id: 'r1-v2',
    studyId: 's1',
    patientId: 'p1',
    radiologistId: 'u1',
    radiologistName: 'Dr. Smith',
    status: 'final',
    clinicalHistory: 'Chest pain.',
    clinicalIndication: 'Rule out PE.',
    technique: 'CT chest with contrast.',
    findings: 'No pulmonary embolism. Lungs clear.',
    impression: 'No acute cardiopulmonary process.',
    recommendations: 'None.',
    criticalFindings: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    finalizedAt: '2024-01-15T11:30:00Z',
    version: 2,
  },
  {
    id: 'r1-v1',
    studyId: 's1',
    patientId: 'p1',
    radiologistId: 'u1',
    radiologistName: 'Dr. Smith',
    status: 'preliminary',
    clinicalHistory: 'Chest pain.',
    clinicalIndication: 'Rule out PE.',
    technique: 'CT chest with contrast.',
    findings: 'No pulmonary embolism identified.',
    impression: 'No PE.',
    recommendations: '',
    criticalFindings: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
    version: 1,
  },
]

export function ReportHistory() {
  const { reportHistory } = useStore()
  const [compareMode, setCompareMode] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [diffView, setDiffView] = useState<{ old: Report; new: Report } | null>(null)

  const history = reportHistory.length > 0 ? reportHistory : demoHistory

  const toggleSelect = (id: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const handleCompare = () => {
    if (selectedVersions.length !== 2) return
    const oldReport = history.find((r) => r.id === selectedVersions[0])
    const newReport = history.find((r) => r.id === selectedVersions[1])
    if (oldReport && newReport) {
      setDiffView({ old: oldReport, new: newReport })
    }
  }

  const handleRestore = (report: Report) => {
    // In real app, would restore this version
    useStore.getState().setReport(report)
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-600',
    preliminary: 'bg-amber-600',
    final: 'bg-emerald-600',
    amended: 'bg-blue-600',
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-medical-400" />
          <h2 className="text-sm font-semibold text-slate-100">Report History</h2>
        </div>
        <button
          onClick={() => {
            setCompareMode((v) => !v)
            setSelectedVersions([])
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            compareMode ? 'bg-medical-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          {compareMode ? 'Done' : 'Compare'}
        </button>
      </div>

      {compareMode && selectedVersions.length === 2 && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">2 versions selected</span>
          <button
            onClick={handleCompare}
            className="px-3 py-1 rounded-md bg-medical-600 text-white text-xs font-medium hover:bg-medical-500"
          >
            View Diff
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {history.map((report) => (
          <div
            key={report.id}
            className={`rounded-lg border p-3 transition-colors ${
              compareMode && selectedVersions.includes(report.id)
                ? 'bg-medical-950/30 border-medical-700'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${statusColor[report.status]}`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">v{report.version}</span>
                  {report.amendedAt && (
                    <span className="text-[10px] text-blue-400 bg-blue-950/30 px-1.5 rounded">Amended</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 truncate">{report.radiologistName}</p>
                <p className="text-[10px] text-slate-500">
                  {new Date(report.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {compareMode ? (
                  <button
                    onClick={() => toggleSelect(report.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedVersions.includes(report.id)
                        ? 'bg-medical-600 border-medical-500 text-white'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {selectedVersions.includes(report.id) && <span className="text-[10px]">✓</span>}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(report)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    title="Restore version"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-8">No report history available.</p>
        )}
      </div>

      {/* Diff Modal */}
      {diffView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">
                Diff: v{diffView.old.version} → v{diffView.new.version}
              </h3>
              <button onClick={() => setDiffView(null)} className="p-1 text-slate-400 hover:text-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {(['clinicalHistory', 'clinicalIndication', 'technique', 'findings', 'impression', 'recommendations'] as const).map(
                (field) => {
                  const oldVal = diffView.old[field] || ''
                  const newVal = diffView.new[field] || ''
                  const changed = oldVal !== newVal
                  return (
                    <div key={field} className="space-y-1">
                      <p className="font-semibold text-slate-400 capitalize">{field.replace(/([A-Z])/g, ' $1')}</p>
                      {changed ? (
                        <>
                          <p className="bg-red-950/30 border border-red-900/50 rounded p-2 text-red-300 line-through">
                            {oldVal || '(empty)'}
                          </p>
                          <p className="bg-emerald-950/30 border border-emerald-900/50 rounded p-2 text-emerald-300">
                            {newVal || '(empty)'}
                          </p>
                        </>
                      ) : (
                        <p className="bg-slate-800 rounded p-2 text-slate-300">{newVal || '(empty)'}</p>
                      )}
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
