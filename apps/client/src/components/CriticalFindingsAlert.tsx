import { useState } from 'react'
import { AlertTriangle, Check, Bell, X, ShieldAlert } from 'lucide-react'
import { useStore } from '../stores/useStore'

export function CriticalFindingsAlert() {
  const { criticalFindings, acknowledgeFinding, currentUser } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const unacknowledged = criticalFindings.filter((f) => !f.acknowledged)

  if (unacknowledged.length === 0) return null

  const handleAcknowledge = (id: string) => {
    if (!currentUser) return
    acknowledgeFinding(id, currentUser.name)
  }

  return (
    <>
      {/* Pulsing Banner */}
      <div
        className="fixed top-14 left-0 right-0 z-40 bg-red-950/90 border-b border-red-700 animate-pulse cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-center gap-2 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-red-300">
            {unacknowledged.length} Unacknowledged Critical Finding{unacknowledged.length > 1 ? 's' : ''}
          </span>
          <span className="text-xs text-red-400 underline">Click to review</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-red-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-red-950/50 border-b border-red-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-bold text-red-200">Critical Findings</h2>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-3 h-3 rounded border-slate-600"
                  />
                  <Bell className="w-3 h-3" />
                  Sound
                </label>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Findings List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {unacknowledged.map((finding) => (
                <div
                  key={finding.id}
                  className="rounded-lg bg-slate-800 border border-red-900/50 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Patient: {finding.studyId}</p>
                      <p className="text-xs text-slate-400">Study: {finding.studyId}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                        finding.severity === 'critical'
                          ? 'bg-red-600'
                          : finding.severity === 'urgent'
                          ? 'bg-amber-600'
                          : 'bg-yellow-600'
                      }`}
                    >
                      {finding.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-100 bg-slate-900/50 rounded px-2 py-1.5">
                    {finding.finding}
                  </p>
                  <button
                    onClick={() => handleAcknowledge(finding.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
