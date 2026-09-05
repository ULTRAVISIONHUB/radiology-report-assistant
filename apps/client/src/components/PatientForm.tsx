import { useState, useEffect } from 'react'
import { User, AlertCircle, CheckCircle, Plus } from 'lucide-react'
import { useStore } from '../stores/useStore'
import type { Patient, Study } from '../types'

function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string
  type?: string
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  readOnly?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 ${
          readOnly ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      />
    </div>
  )
}

export function PatientForm() {
  const { currentPatient, currentStudy, addPatient, addStudy, setPatient, setStudy } = useStore()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    id: currentPatient?.id || crypto.randomUUID(),
    mrn: currentPatient?.mrn || '',
    name: currentPatient?.name || '',
    dateOfBirth: currentPatient?.dateOfBirth || '',
    age: currentPatient?.age || 0,
    sex: (currentPatient?.sex || 'M') as 'M' | 'F' | 'O',
    accessionNumber: currentPatient?.accessionNumber || '',
    referringPhysician: currentPatient?.referringPhysician || '',
    department: currentPatient?.department || '',
    clinicalPriority: (currentPatient?.clinicalPriority || 'routine') as 'routine' | 'urgent' | 'stat',
    allergies: currentPatient?.allergies || '',
    contrastSensitivity: currentPatient?.contrastSensitivity || false,
    egfr: currentPatient?.renalFunction?.egfr || 0,
    creatinine: currentPatient?.renalFunction?.creatinine || 0,
    careSetting: currentPatient?.careSetting || 'outpatient',
    modality: currentStudy?.modality || '',
    studyDescription: currentStudy?.studyDescription || '',
    studyDate: currentStudy?.studyDate || new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (currentPatient) {
      setForm({
        id: currentPatient.id,
        mrn: currentPatient.mrn,
        name: currentPatient.name,
        dateOfBirth: currentPatient.dateOfBirth,
        age: currentPatient.age,
        sex: currentPatient.sex,
        accessionNumber: currentPatient.accessionNumber,
        referringPhysician: currentPatient.referringPhysician,
        department: currentPatient.department,
        clinicalPriority: currentPatient.clinicalPriority,
        allergies: currentPatient.allergies,
        contrastSensitivity: currentPatient.contrastSensitivity,
        egfr: currentPatient.renalFunction.egfr,
        creatinine: currentPatient.renalFunction.creatinine,
        careSetting: currentPatient.careSetting,
        modality: currentStudy?.modality || '',
        studyDescription: currentStudy?.studyDescription || '',
        studyDate: currentStudy?.studyDate || new Date().toISOString().split('T')[0],
      })
    } else {
      setForm({
        id: crypto.randomUUID(),
        mrn: '',
        name: '',
        dateOfBirth: '',
        age: 0,
        sex: 'M',
        accessionNumber: '',
        referringPhysician: '',
        department: '',
        clinicalPriority: 'routine',
        allergies: '',
        contrastSensitivity: false,
        egfr: 0,
        creatinine: 0,
        careSetting: 'outpatient',
        modality: '',
        studyDescription: '',
        studyDate: new Date().toISOString().split('T')[0],
      })
    }
  }, [currentPatient?.id])

  useEffect(() => {
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
      setForm((prev) => ({ ...prev, age: Math.max(0, age) }))
    }
  }, [form.dateOfBirth])

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    const patient: Patient = {
      id: form.id,
      mrn: form.mrn,
      name: form.name,
      dateOfBirth: form.dateOfBirth,
      age: form.age,
      sex: form.sex,
      accessionNumber: form.accessionNumber,
      referringPhysician: form.referringPhysician,
      department: form.department,
      clinicalPriority: form.clinicalPriority,
      allergies: form.allergies,
      contrastSensitivity: form.contrastSensitivity,
      renalFunction: { egfr: form.egfr, creatinine: form.creatinine },
      careSetting: form.careSetting,
    }

    addPatient(patient)

    const study: Study = {
      id: crypto.randomUUID(),
      patientId: form.id,
      modality: form.modality || 'Unknown',
      studyDescription: form.studyDescription || `Imaging study for ${form.name || 'Patient'}`,
      studyDate: form.studyDate,
      series: [],
      status: 'pending',
      priority: form.clinicalPriority,
    }

    addStudy(study)
    setSaved(true)
  }

  const handleAddAnother = () => {
    setPatient(null)
    setStudy(null)
    setSaved(false)
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <User className="w-5 h-5 text-medical-400" />
        <h2 className="text-sm font-semibold text-slate-100">Patient Demographics</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {saved && (
          <div className="rounded-md bg-emerald-950/30 border border-emerald-800 px-3 py-2 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-300">Patient saved successfully.</p>
          </div>
        )}

        <div className="rounded-md bg-medical-950/30 border border-medical-800 px-3 py-2 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-medical-400 mt-0.5 shrink-0" />
          <p className="text-xs text-medical-300">
            Fill patient details below. All fields support full text entry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput label="MRN" value={form.mrn} onChange={(v) => handleChange('mrn', v)} placeholder="Medical Record Number" />
          <FormInput label="Full Name" value={form.name} onChange={(v) => handleChange('name', v)} placeholder="Patient full name" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
          </div>
          <FormInput label="Age" type="number" value={form.age} onChange={() => {}} readOnly />
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Sex</label>
            <select
              value={form.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput label="Accession Number" value={form.accessionNumber} onChange={(v) => handleChange('accessionNumber', v)} />
          <FormInput label="Referring Physician" value={form.referringPhysician} onChange={(v) => handleChange('referringPhysician', v)} />
        </div>

        <FormInput label="Department" value={form.department} onChange={(v) => handleChange('department', v)} />

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Clinical Priority</label>
          <div className="flex gap-2">
            {(['routine', 'urgent', 'stat'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handleChange('clinicalPriority', p)}
                className={`flex-1 py-2 rounded-md text-xs font-medium capitalize transition-colors ${
                  form.clinicalPriority === p
                    ? p === 'stat'
                      ? 'bg-red-600 text-white'
                      : p === 'urgent'
                      ? 'bg-amber-600 text-white'
                      : 'bg-medical-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Allergies</label>
          <textarea
            value={form.allergies}
            onChange={(e) => handleChange('allergies', e.target.value)}
            rows={3}
            placeholder="Known allergies and reactions..."
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500 resize-y"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.contrastSensitivity}
            onChange={(e) => handleChange('contrastSensitivity', e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-medical-500"
          />
          <span className="text-sm text-slate-200">Contrast Sensitivity / Allergy</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput label="eGFR (mL/min/1.73m²)" type="number" value={form.egfr} onChange={(v) => handleChange('egfr', parseFloat(v) || 0)} />
          <FormInput label="Creatinine (mg/dL)" type="number" value={form.creatinine} onChange={(v) => handleChange('creatinine', parseFloat(v) || 0)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Care Setting</label>
          <select
            value={form.careSetting}
            onChange={(e) => handleChange('careSetting', e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
          >
            <option value="outpatient">Outpatient</option>
            <option value="inpatient">Inpatient</option>
            <option value="emergency">Emergency Department</option>
            <option value="icu">Intensive Care Unit</option>
            <option value="or">Operating Room</option>
          </select>
        </div>

        {/* Study metadata */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Study Metadata</p>
          <p className="text-[10px] text-slate-500">
            A "Study" is the imaging examination (e.g., CT Chest, Brain MRI). It is created automatically when you save.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Modality</label>
              <select
                value={form.modality}
                onChange={(e) => handleChange('modality', e.target.value)}
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
              >
                <option value="">Select modality...</option>
                <option value="CT">CT - Computed Tomography</option>
                <option value="MRI">MRI - Magnetic Resonance</option>
                <option value="XR">XR - Radiography</option>
                <option value="US">US - Ultrasound</option>
                <option value="NM">NM - Nuclear Medicine</option>
                <option value="PET">PET-CT</option>
                <option value="MG">Mammography</option>
                <option value="DX">Digital X-Ray</option>
                <option value="CR">Computed Radiography</option>
                <option value="RF">Fluoroscopy</option>
                <option value="XA">X-Ray Angiography</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Study Date</label>
              <input
                type="date"
                value={form.studyDate}
                onChange={(e) => handleChange('studyDate', e.target.value)}
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
              />
            </div>
          </div>
          <FormInput label="Study Description" value={form.studyDescription} onChange={(v) => handleChange('studyDescription', v)} placeholder="e.g., CT Chest with IV contrast" />
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 space-y-2">
        <button
          onClick={handleSubmit}
          className="w-full py-2 rounded-md bg-medical-600 text-white text-sm font-medium hover:bg-medical-500 transition-colors"
        >
          Save Patient & Study
        </button>
        {saved && (
          <button
            onClick={handleAddAnother}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-slate-800 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Patient
          </button>
        )}
      </div>
    </div>
  )
}
