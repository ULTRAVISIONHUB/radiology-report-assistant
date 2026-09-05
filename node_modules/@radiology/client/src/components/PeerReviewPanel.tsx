import { useState } from 'react'
import { CheckCircle, XCircle, MessageSquare, Eye, UserCheck, AlertTriangle } from 'lucide-react'
import { useStore } from '../stores/useStore'
import type { Report } from '../types'

const demoPendingReviews: Report[] = [
  {
    id: 'r-pending-1',
    studyId: 's2',
    patientId: 'p2',
    radiologistId: 'u-resident',
    radiologistName: 'Dr. Resident',
    status: 'preliminary',
    clinicalHistory: 'Abdominal pain.',
    clinicalIndication: 'Evaluate for appendicitis.',
    technique: 'CT abdomen/pelvis with contrast.',
    findings:
      'The appendix is mildly dilated to 9mm with periappendiceal fat stranding. No perforation or abscess.',
    impression: 'Findings consistent with acute uncomplicated appendicitis.',
    recommendations: 'Surgical consultation recommended.',
    criticalFindings: false,
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    version: 1,
    reviewStatus: 'pending',
  },
  {
    id: 'r-pending-2',
    studyId: 's3',
    patientId: 'p3',
    radiologistId: 'u-resident',
    radiologistName: 'Dr. Resident',
    status: 'preliminary',
    clinicalHistory: 'Head trauma.',
    clinicalIndication: 'Evaluate for intracranial hemorrhage.',
    technique: 'CT head without contrast.',
    findings: 'Small 4mm subdural hematoma along the right cerebral convexity. No midline shift.',
    impression: 'Small right subdural hematoma without mass effect.',
    recommendations: 'Neurosurgery consult. Repeat CT in 6 hours.',
    criticalFindings: true,
    criticalFindingsText: 'Small SDH identified.',
    createdAt: '2024-01-16T07:30:00Z',
    updatedAt: '2024-01-16T08:45:00Z',
    version: 1,
    reviewStatus: 'pending',
  },
]

export function PeerReviewPanel() {
  const { currentUser, saveReport } = useStore()
  const [pendingReviews, setPendingReviews] = useState<Report[]>(demoPendingReviews)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [discrepancy, setDiscrepancy] = useState('')
  const [showDiscrepancy, setShowDiscrepancy] = useState(false)

  const isAttending = currentUser?.role === 'attending' || currentUser?.role === 'admin'

  const handleApprove = (reportId: string) => {
    if (!currentUser) return
    const updated = pendingReviews.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: 'final' as const,
            reviewStatus: 'approved' as const,
            reviewComments: reviewComment,
            reviewedBy: currentUser.name,
            finalizedAt: new Date().toISOString(),
          }
        : r
    )
    setPendingReviews(updated)
    setSelectedReport(null)
    setReviewComment('')
  }

  const handleReject = (reportId: string) => {
    if (!currentUser) return
    const updated = pendingReviews.map((r) =>
      r.id === reportId
        ? {
            ...r,
            reviewStatus: 'rejected' as const,
            reviewComments: reviewComment,
            reviewedBy: currentUser.name,
          }
        : r
    )
    setPendingReviews(updated)
    setSelectedReport(null)
    setReviewComment('')
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <UserCheck className="w-5 h-5 text-medical-400" />
        <h2 className="text-sm font-semibold text-slate-100">Peer Review</h2>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white">
          {pendingReviews.filter((r) => r.reviewStatus === 'pending').length} Pending
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pendingReviews.map((report) => (
          <div
            key={report.id}
            className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white">
                    {report.status}
                  </span>
                  {report.criticalFindings && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      Critical
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">By {report.radiologistName}</p>
                <p className="text-[10px] text-slate-500">{new Date(report.updatedAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedReport(report)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{report.impression}</p>

            {isAttending && report.reviewStatus === 'pending' && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleApprove(report.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-medium hover:bg-emerald-500"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(report)
                    setShowDiscrepancy(true)
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white text-[10px] font-medium hover:bg-red-500"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
              </div>
            )}

            {report.reviewStatus === 'approved' && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                Approved by {report.reviewedBy}
              </div>
            )}
            {report.reviewStatus === 'rejected' && (
              <div className="flex items-center gap-1 text-[10px] text-red-400">
                <XCircle className="w-3 h-3" />
                Rejected by {report.reviewedBy}
              </div>
            )}
          </div>
        ))}

        {pendingReviews.length === 0 && (
          <div className="text-center py-8">
            <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No reports pending review.</p>
          </div>
        )}
      </div>

      {/* Review detail modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">Review Report</h3>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-400 hover:text-slate-100">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-slate-300">
              <div className="bg-slate-800 rounded p-2 space-y-1">
                <p><span className="text-slate-400">Author:</span> {selectedReport.radiologistName}</p>
                <p><span className="text-slate-400">Modality:</span> {selectedReport.studyId}</p>
                <p><span className="text-slate-400">Status:</span> {selectedReport.status}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Findings</p>
                <p className="bg-slate-800 rounded p-2">{selectedReport.findings}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-1">Impression</p>
                <p className="bg-slate-800 rounded p-2">{selectedReport.impression}</p>
              </div>

              {showDiscrepancy && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Discrepancy / Reason for Rejection
                  </label>
                  <textarea
                    value={discrepancy}
                    onChange={(e) => setDiscrepancy(e.target.value)}
                    rows={3}
                    placeholder="Describe the discrepancy..."
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 resize-y"
                  />
                </div>
              )}

              <div className="space-y-1">
                <p className="font-semibold text-slate-400">Review Comments</p>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  placeholder="Add comments..."
                  className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500 resize-y"
                />
              </div>
            </div>
            {isAttending && selectedReport.reviewStatus === 'pending' && (
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-800 bg-slate-900">
                <button
                  onClick={() => {
                    setReviewComment(discrepancy)
                    handleReject(selectedReport.id)
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-500"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedReport.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve & Finalize
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
