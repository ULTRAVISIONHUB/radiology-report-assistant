import { useState, useMemo } from 'react'
import { Users, Search, Plus, FileText, Activity } from 'lucide-react'
import { useStore } from '../stores/useStore'

export function PatientList() {
  const {
    patients,
    selectedPatientId,
    selectPatient,
    setActivePanel,
    setPatient,
    getPatientStudies,
    getPatientReports,
  } = useStore()

  const [search, setSearch] = useState('')

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q)
    )
  }, [patients, search])

  const handleSelect = (patientId: string) => {
    selectPatient(patientId)
  }

  const handleAddNew = () => {
    setPatient(null)
    setActivePanel('patient')
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <Users className="w-5 h-5 text-medical-400" />
        <h2 className="text-sm font-semibold text-slate-100">Patients</h2>
      </div>

      <div className="p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or MRN..."
            className="w-full rounded-md bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500"
          />
        </div>

        {/* Add new */}
        <button
          onClick={handleAddNew}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-medical-600 text-white text-sm font-medium hover:bg-medical-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            {search ? 'No patients match your search.' : 'No patients yet. Add your first patient above.'}
          </div>
        )}

        {filteredPatients.map((patient) => {
          const isActive = selectedPatientId === patient.id
          const studies = getPatientStudies(patient.id)
          const reports = getPatientReports(patient.id)
          const lastStudyDate = studies[0]?.studyDate
            ? new Date(studies[0].studyDate).toLocaleDateString()
            : '—'

          return (
            <button
              key={patient.id}
              onClick={() => handleSelect(patient.id)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                isActive
                  ? 'border-medical-600 bg-medical-950/30'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{patient.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">MRN: {patient.mrn}</p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {patient.age} {patient.sex}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {studies.length} study{studies.length !== 1 ? 'ies' : 'y'}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {reports.length} report{reports.length !== 1 ? 's' : ''}
                </span>
              </div>

              {lastStudyDate !== '—' && (
                <p className="mt-1 text-[10px] text-slate-500">Last study: {lastStudyDate}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
