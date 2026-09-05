import { useStore } from '../stores/useStore'
import type { Patient, Study, Series, Instance } from '../types'

function getPacsConfig() {
  return useStore.getState().pacsConfig
}

function getBaseQidoUrl(): string {
  const { qidoUrl, serverUrl } = getPacsConfig()
  return qidoUrl || serverUrl || ''
}

function getBaseWadoUrl(): string {
  const { wadoUrl, serverUrl } = getPacsConfig()
  return wadoUrl || serverUrl || ''
}

function isMock(): boolean {
  const cfg = getPacsConfig()
  return !cfg.enabled || (!cfg.serverUrl && !cfg.qidoUrl && !cfg.wadoUrl)
}

function dicomPatientToPatient(item: any): Patient {
  const name = item['00100010']?.Value?.[0]?.Alphabetic || item['00100010']?.Value?.[0] || 'Unknown'
  const id = item['00100020']?.Value?.[0] || crypto.randomUUID()
  const dob = item['00100030']?.Value?.[0] || ''
  const sex = (item['00100040']?.Value?.[0] || 'O') as 'M' | 'F' | 'O'
  let age = 0
  if (dob) {
    const birth = new Date(dob)
    const today = new Date()
    age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    age = Math.max(0, age)
  }
  return {
    id,
    mrn: id,
    name,
    dateOfBirth: dob,
    age,
    sex,
    accessionNumber: '',
    referringPhysician: '',
    department: '',
    clinicalPriority: 'routine',
    allergies: '',
    contrastSensitivity: false,
    renalFunction: { egfr: 0, creatinine: 0 },
    careSetting: 'outpatient',
  }
}

function dicomStudyToStudy(item: any, patientId: string): Study {
  return {
    id: item['0020000D']?.Value?.[0] || crypto.randomUUID(),
    patientId,
    modality: item['00080061']?.Value?.[0] || item['00080060']?.Value?.[0] || 'OT',
    studyDescription: item['00081030']?.Value?.[0] || '',
    studyDate: item['00080020']?.Value?.[0] || '',
    series: [],
    status: 'pending',
    priority: 'routine',
  }
}

function dicomSeriesToSeries(item: any): Series {
  return {
    id: item['0020000E']?.Value?.[0] || crypto.randomUUID(),
    seriesNumber: item['00200011']?.Value?.[0] || 1,
    seriesDescription: item['0008103E']?.Value?.[0] || '',
    modality: item['00080060']?.Value?.[0] || '',
    instances: [],
  }
}

/* ─────────────── MOCK DATA ─────────────── */

function getMockPatients(): Patient[] {
  return [
    {
      id: 'MOCK-PAT-001',
      mrn: '12345',
      name: 'John Doe',
      dateOfBirth: '1980-01-15',
      age: 45,
      sex: 'M',
      accessionNumber: 'ACC-001',
      referringPhysician: 'Dr. Smith',
      department: 'Radiology',
      clinicalPriority: 'routine',
      allergies: 'None',
      contrastSensitivity: false,
      renalFunction: { egfr: 90, creatinine: 1.0 },
      careSetting: 'outpatient',
    },
    {
      id: 'MOCK-PAT-002',
      mrn: '67890',
      name: 'Jane Smith',
      dateOfBirth: '1992-06-22',
      age: 32,
      sex: 'F',
      accessionNumber: 'ACC-002',
      referringPhysician: 'Dr. Johnson',
      department: 'Radiology',
      clinicalPriority: 'urgent',
      allergies: 'Penicillin',
      contrastSensitivity: false,
      renalFunction: { egfr: 110, creatinine: 0.9 },
      careSetting: 'inpatient',
    },
  ]
}

function getMockStudies(patientId: string): Study[] {
  if (patientId === 'MOCK-PAT-001') {
    return [
      {
        id: '1.2.840.113619.2.55.3.2831164357.1234.1',
        patientId: 'MOCK-PAT-001',
        modality: 'CT',
        studyDescription: 'CT Chest with IV contrast',
        studyDate: '2025-01-10',
        series: [],
        status: 'pending',
        priority: 'routine',
      },
      {
        id: '1.2.840.113619.2.55.3.2831164357.5678.1',
        patientId: 'MOCK-PAT-001',
        modality: 'MRI',
        studyDescription: 'MRI Brain w/o contrast',
        studyDate: '2024-11-05',
        series: [],
        status: 'final',
        priority: 'routine',
      },
    ]
  }
  if (patientId === 'MOCK-PAT-002') {
    return [
      {
        id: '1.2.840.113619.2.55.3.2831164357.9999.1',
        patientId: 'MOCK-PAT-002',
        modality: 'XR',
        studyDescription: 'Chest X-Ray PA/Lateral',
        studyDate: '2025-02-20',
        series: [],
        status: 'preliminary',
        priority: 'urgent',
      },
    ]
  }
  return []
}

function getMockSeries(studyInstanceUid: string): Series[] {
  if (studyInstanceUid === '1.2.840.113619.2.55.3.2831164357.1234.1') {
    return [
      { id: 'SER-001', seriesNumber: 1, seriesDescription: 'Axial', modality: 'CT', instances: getMockInstances('SER-001') },
      { id: 'SER-002', seriesNumber: 2, seriesDescription: 'Coronal', modality: 'CT', instances: getMockInstances('SER-002') },
    ]
  }
  if (studyInstanceUid === '1.2.840.113619.2.55.3.2831164357.5678.1') {
    return [
      { id: 'SER-003', seriesNumber: 1, seriesDescription: 'T1', modality: 'MRI', instances: getMockInstances('SER-003') },
      { id: 'SER-004', seriesNumber: 2, seriesDescription: 'T2', modality: 'MRI', instances: getMockInstances('SER-004') },
    ]
  }
  if (studyInstanceUid === '1.2.840.113619.2.55.3.2831164357.9999.1') {
    return [
      { id: 'SER-005', seriesNumber: 1, seriesDescription: 'PA', modality: 'XR', instances: getMockInstances('SER-005') },
      { id: 'SER-006', seriesNumber: 2, seriesDescription: 'Lateral', modality: 'XR', instances: getMockInstances('SER-006') },
    ]
  }
  return []
}

function getMockInstances(seriesId: string): Instance[] {
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `${seriesId}-INST-${i + 1}`,
    instanceNumber: i + 1,
    sopClassUid: '1.2.840.10008.5.1.4.1.1.2',
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    thumbnailUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  }))
}

/* ─────────────── PUBLIC API ─────────────── */

export async function searchPatients(query: string): Promise<Patient[]> {
  if (isMock()) return getMockPatients()
  const base = getBaseQidoUrl()
  const url = `${base}/patients?PatientName=${encodeURIComponent(query)}*&fuzzymatching=true&limit=25`
  const res = await fetch(url, { headers: { Accept: 'application/dicom+json' } })
  if (!res.ok) throw new Error(`QIDO patient search failed: ${res.status}`)
  const data = await res.json()
  return (data || []).map(dicomPatientToPatient)
}

export async function searchStudies(patientId: string): Promise<Study[]> {
  if (isMock()) return getMockStudies(patientId)
  const base = getBaseQidoUrl()
  const url = `${base}/studies?PatientID=${encodeURIComponent(patientId)}&includefield=StudyDescription,StudyDate,ModalitiesInStudy,StudyInstanceUID`
  const res = await fetch(url, { headers: { Accept: 'application/dicom+json' } })
  if (!res.ok) throw new Error(`QIDO study search failed: ${res.status}`)
  const data = await res.json()
  return (data || []).map((item: any) => dicomStudyToStudy(item, patientId))
}

export async function retrieveSeries(studyInstanceUid: string): Promise<Series[]> {
  if (isMock()) return getMockSeries(studyInstanceUid)
  const base = getBaseQidoUrl()
  const url = `${base}/studies/${studyInstanceUid}/series?includefield=SeriesDescription,SeriesNumber,Modality`
  const res = await fetch(url, { headers: { Accept: 'application/dicom+json' } })
  if (!res.ok) throw new Error(`QIDO series search failed: ${res.status}`)
  const data = await res.json()
  return (data || []).map(dicomSeriesToSeries)
}

export async function retrieveInstance(instanceUrl: string): Promise<Blob> {
  if (isMock()) {
    const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: 'image/png' })
  }
  const res = await fetch(instanceUrl, {
    headers: { Accept: 'multipart/related; type="application/dicom"' },
  })
  if (!res.ok) throw new Error(`WADO retrieve failed: ${res.status}`)
  return res.blob()
}

export async function fetchDicomAsPng(wadoUrl: string): Promise<string> {
  if (isMock()) {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  }
  const res = await fetch(wadoUrl, { headers: { Accept: 'image/png' } })
  if (!res.ok) throw new Error(`WADO PNG render failed: ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
