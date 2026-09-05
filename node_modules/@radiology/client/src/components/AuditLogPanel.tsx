import { useState } from 'react'
import { Download, Filter, Search, FileSpreadsheet } from 'lucide-react'
import { useStore } from '../stores/useStore'
import type { AuditEvent } from '../types'

const demoAuditEvents: AuditEvent[] = [
  {
    id: 'a1',
    userId: 'u1',
    userName: 'Dr. Smith',
    action: 'LOGIN',
    resourceType: 'auth',
    resourceId: 'session-1',
    details: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T08:00:00Z',
  },
  {
    id: 'a2',
    userId: 'u1',
    userName: 'Dr. Smith',
    action: 'VIEW_STUDY',
    resourceType: 'study',
    resourceId: 's1',
    details: 'Opened study CT-2024-001',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T08:05:00Z',
  },
  {
    id: 'a3',
    userId: 'u1',
    userName: 'Dr. Smith',
    action: 'CREATE_REPORT',
    resourceType: 'report',
    resourceId: 'r1',
    details: 'Created draft report for study s1',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T08:15:00Z',
  },
  {
    id: 'a4',
    userId: 'u1',
    userName: 'Dr. Smith',
    action: 'UPDATE_REPORT',
    resourceType: 'report',
    resourceId: 'r1',
    details: 'Updated findings section',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T08:30:00Z',
  },
  {
    id: 'a5',
    userId: 'u2',
    userName: 'Dr. Jones',
    action: 'FINALIZE_REPORT',
    resourceType: 'report',
    resourceId: 'r1',
    details: 'Finalized report r1',
    ipAddress: '192.168.1.101',
    timestamp: '2024-01-15T09:00:00Z',
  },
  {
    id: 'a6',
    userId: 'u1',
    userName: 'Dr. Smith',
    action: 'EXPORT_PDF',
    resourceType: 'report',
    resourceId: 'r1',
    details: 'Exported report to PDF',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T09:15:00Z',
  },
]

export function AuditLogPanel() {
  const [events] = useState<AuditEvent[]>(demoAuditEvents)
  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = events.filter((e) => {
    const matchesUser = !filterUser || e.userName.toLowerCase().includes(filterUser.toLowerCase())
    const matchesAction = !filterAction || e.action === filterAction
    const matchesDateFrom = !filterDateFrom || new Date(e.timestamp) >= new Date(filterDateFrom)
    const matchesDateTo = !filterDateTo || new Date(e.timestamp) <= new Date(filterDateTo + 'T23:59:59')
    const matchesSearch =
      !searchTerm ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resourceId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesUser && matchesAction && matchesDateFrom && matchesDateTo && matchesSearch
  })

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address']
    const rows = filtered.map((e) => [
      new Date(e.timestamp).toISOString(),
      e.userName,
      e.action,
      e.resourceType,
      e.resourceId,
      e.details,
      e.ipAddress,
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const uniqueActions = Array.from(new Set(events.map((e) => e.action)))

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-medical-400" />
          <h2 className="text-sm font-semibold text-slate-100">Audit Log</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showFilters ? 'bg-medical-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md bg-slate-800 border border-slate-700 pl-7 pr-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
          </div>
          <input
            type="text"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            placeholder="User"
            className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
          />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 focus:outline-none"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 focus:outline-none"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900 sticky top-0">
            <tr>
              {['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP'].map((h) => (
                <th key={h} className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="px-3 py-2 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(e.timestamp).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-xs text-slate-200 whitespace-nowrap">{e.userName}</td>
                <td className="px-3 py-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {e.action}
                  </span>
                </td>
                <td className="px-3 py-2 text-[10px] text-slate-400">
                  {e.resourceType}:{e.resourceId}
                </td>
                <td className="px-3 py-2 text-xs text-slate-300 max-w-[200px] truncate">{e.details}</td>
                <td className="px-3 py-2 text-[10px] text-slate-500 font-mono">{e.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">No audit events match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
