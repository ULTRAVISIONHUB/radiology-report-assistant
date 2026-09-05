import { create } from 'zustand'
import type { Patient, Study, Report, ReportTemplate, User, Measurement, CriticalFinding, VoiceDictationState } from '../types'

export interface ReportDraft {
  status: 'draft' | 'preliminary' | 'final' | 'amended'
  clinicalHistory: string
  clinicalIndication: string
  technique: string
  findings: string
  impression: string
  recommendations: string
  criticalFindings: boolean
  criticalSeverity: 'critical' | 'urgent' | 'unexpected'
  comparisonStudyId: string
  comparisonText: string
  laterality: string
  contrastUsed: string
  imageQuality: string
  bodyHabitus: string
  pregnancyStatus: string
  comorbidities: string
  physicalExam: string
  labValues: string
}

interface PacsConfig {
  enabled: boolean
  serverUrl: string
  wadoUrl: string
  qidoUrl: string
  username: string
  password: string
}

function loadPacsConfig(): Partial<PacsConfig> | null {
  try {
    const raw = localStorage.getItem('pacs_config')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

interface AppState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void

  // Patient & Study
  currentPatient: Patient | null
  currentStudy: Study | null
  setPatient: (patient: Patient | null) => void
  setStudy: (study: Study | null) => void

  // Multi-patient
  patients: Patient[]
  selectedPatientId: string | null
  studies: Study[]
  reports: Report[]
  pacsConfig: PacsConfig
  addPatient: (patient: Patient) => void
  selectPatient: (patientId: string) => void
  addStudy: (study: Study) => void
  addReport: (report: Report) => void
  setPacsConfig: (config: Partial<PacsConfig>) => void
  getPatientStudies: (patientId: string) => Study[]
  getStudyReports: (studyId: string) => Report[]
  getPatientReports: (patientId: string) => Report[]

  // Viewer
  selectedInstanceId: string | null
  zoom: number
  windowCenter: number
  windowWidth: number
  pan: { x: number; y: number }
  measurements: Measurement[]
  activeTool: 'pan' | 'zoom' | 'window' | 'measure' | 'arrow' | 'roi'
  setSelectedInstance: (id: string | null) => void
  setZoom: (zoom: number) => void
  setWindowLevel: (center: number, width: number) => void
  setPan: (pan: { x: number; y: number }) => void
  addMeasurement: (m: Measurement) => void
  removeMeasurement: (id: string) => void
  setActiveTool: (tool: AppState['activeTool']) => void
  resetViewer: () => void

  // Report
  currentReport: Report | null
  reportHistory: Report[]
  setReport: (report: Report | null) => void
  saveReport: (report: Report) => void
  addToHistory: (report: Report) => void
  reportDraft: ReportDraft
  setReportDraft: (draft: Partial<ReportDraft>) => void
  resetReportDraft: () => void

  // Templates
  templates: ReportTemplate[]
  selectedTemplate: ReportTemplate | null
  setTemplates: (templates: ReportTemplate[]) => void
  setSelectedTemplate: (template: ReportTemplate | null) => void

  // Voice Dictation
  voiceState: VoiceDictationState
  setVoiceState: (state: Partial<VoiceDictationState>) => void

  // Critical Findings
  criticalFindings: CriticalFinding[]
  addCriticalFinding: (finding: CriticalFinding) => void
  acknowledgeFinding: (id: string, userName: string) => void

  // UI
  sidebarOpen: boolean
  activePanel: 'patient' | 'patients' | 'viewer' | 'report' | 'templates' | 'history' | 'settings'
  setSidebarOpen: (open: boolean) => void
  setActivePanel: (panel: AppState['activePanel']) => void

  // Loading
  isLoading: boolean
  loadingMessage: string
  setLoading: (loading: boolean, message?: string) => void

  // Clinical Context
  clinicalSuspicions: string[]
  roi: string
  guidelines: string
  symptoms: string[]
  uploadedFiles: { id: string; url: string; type: string; name: string }[]
  roiBox: { x: number; y: number; w: number; h: number } | null
  setClinicalSuspicions: (suspicions: string[]) => void
  setRoi: (roi: string) => void
  setGuidelines: (guidelines: string) => void
  setSymptoms: (symptoms: string[]) => void
  setUploadedFiles: (files: { id: string; url: string; type: string; name: string }[]) => void
  setRoiBox: (box: { x: number; y: number; w: number; h: number } | null) => void
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  isAuthenticated: false,
  login: (user) => set({ currentUser: user, isAuthenticated: true }),
  logout: () => set({ currentUser: null, isAuthenticated: false }),

  // Patient & Study
  currentPatient: null,
  currentStudy: null,
  setPatient: (patient) => set({ currentPatient: patient }),
  setStudy: (study) => set({ currentStudy: study }),

  // Multi-patient
  patients: [],
  selectedPatientId: null,
  studies: [],
  reports: [],
  pacsConfig: {
    enabled: false,
    serverUrl: '',
    wadoUrl: '',
    qidoUrl: '',
    username: '',
    password: '',
    ...loadPacsConfig(),
  },
  addPatient: (patient) =>
    set((state) => {
      const exists = state.patients.find((p) => p.id === patient.id)
      const nextPatients = exists
        ? state.patients.map((p) => (p.id === patient.id ? patient : p))
        : [...state.patients, patient]
      return { patients: nextPatients, currentPatient: patient }
    }),
  selectPatient: (patientId) => {
    const patient = get().patients.find((p) => p.id === patientId) || null
    const patientStudies = get()
      .studies.filter((s) => s.patientId === patientId)
      .sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime())
    const mostRecentStudy = patientStudies[0] || null
    set({ selectedPatientId: patientId, currentPatient: patient, currentStudy: mostRecentStudy })
  },
  addStudy: (study) =>
    set((state) => {
      const exists = state.studies.find((s) => s.id === study.id)
      const nextStudies = exists
        ? state.studies.map((s) => (s.id === study.id ? study : s))
        : [...state.studies, study]
      return { studies: nextStudies, currentStudy: study }
    }),
  addReport: (report) =>
    set((state) => {
      const exists = state.reports.find((r) => r.id === report.id)
      const nextReports = exists
        ? state.reports.map((r) => (r.id === report.id ? report : r))
        : [...state.reports, report]
      return { reports: nextReports, currentReport: report }
    }),
  setPacsConfig: (config) =>
    set((state) => {
      const next = { ...state.pacsConfig, ...config }
      localStorage.setItem('pacs_config', JSON.stringify(next))
      return { pacsConfig: next }
    }),
  getPatientStudies: (patientId) =>
    get()
      .studies.filter((s) => s.patientId === patientId)
      .sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime()),
  getStudyReports: (studyId) =>
    get()
      .reports.filter((r) => r.studyId === studyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  getPatientReports: (patientId) =>
    get()
      .reports.filter((r) => r.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  // Viewer
  selectedInstanceId: null,
  zoom: 1,
  windowCenter: 128,
  windowWidth: 256,
  pan: { x: 0, y: 0 },
  measurements: [],
  activeTool: 'pan',
  setSelectedInstance: (id) => set({ selectedInstanceId: id }),
  setZoom: (zoom) => set({ zoom }),
  setWindowLevel: (center, width) => set({ windowCenter: center, windowWidth: width }),
  setPan: (pan) => set({ pan }),
  addMeasurement: (m) => set((state) => ({ measurements: [...state.measurements, m] })),
  removeMeasurement: (id) => set((state) => ({ measurements: state.measurements.filter((m) => m.id !== id) })),
  setActiveTool: (tool) => set({ activeTool: tool }),
  resetViewer: () => set({ zoom: 1, windowCenter: 128, windowWidth: 256, pan: { x: 0, y: 0 }, measurements: [], roiBox: null }),

  // Report
  currentReport: null,
  reportHistory: [],
  setReport: (report) => set({ currentReport: report }),
  saveReport: (report) =>
    set((state) => {
      const exists = state.reports.find((r) => r.id === report.id)
      const nextReports = exists
        ? state.reports.map((r) => (r.id === report.id ? report : r))
        : [report, ...state.reports]
      return { currentReport: report, reports: nextReports }
    }),
  addToHistory: (report) => set((state) => ({ reportHistory: [report, ...state.reportHistory] })),
  reportDraft: {
    status: 'draft' as const,
    clinicalHistory: '',
    clinicalIndication: '',
    technique: '',
    findings: '',
    impression: '',
    recommendations: '',
    criticalFindings: false,
    criticalSeverity: 'critical',
    comparisonStudyId: '',
    comparisonText: '',
    laterality: '',
    contrastUsed: '',
    imageQuality: '',
    bodyHabitus: '',
    pregnancyStatus: '',
    comorbidities: '',
    physicalExam: '',
    labValues: '',
  },
  setReportDraft: (draft) => set((s) => ({ reportDraft: { ...s.reportDraft, ...draft } })),
  resetReportDraft: () =>
    set({
      reportDraft: {
        status: 'draft' as const,
        clinicalHistory: '',
        clinicalIndication: '',
        technique: '',
        findings: '',
        impression: '',
        recommendations: '',
        criticalFindings: false,
        criticalSeverity: 'critical',
        comparisonStudyId: '',
        comparisonText: '',
        laterality: '',
        contrastUsed: '',
        imageQuality: '',
        bodyHabitus: '',
        pregnancyStatus: '',
        comorbidities: '',
        physicalExam: '',
        labValues: '',
      },
    }),

  // Templates
  templates: [],
  selectedTemplate: null,
  setTemplates: (templates) => set({ templates }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  // Voice
  voiceState: {
    isListening: false,
    transcript: '',
    interimTranscript: '',
    language: 'en-US',
  },
  setVoiceState: (state) => set((s) => ({ voiceState: { ...s.voiceState, ...state } })),

  // Critical Findings
  criticalFindings: [],
  addCriticalFinding: (finding) => set((state) => ({ criticalFindings: [...state.criticalFindings, finding] })),
  acknowledgeFinding: (id, userName) =>
    set((state) => ({
      criticalFindings: state.criticalFindings.map((f) =>
        f.id === id
          ? { ...f, acknowledged: true, acknowledgedAt: new Date().toISOString(), acknowledgedBy: userName }
          : f
      ),
    })),

  // UI
  sidebarOpen: true,
  activePanel: 'viewer',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  // Loading
  isLoading: false,
  loadingMessage: '',
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),

  // Clinical Context
  clinicalSuspicions: [],
  roi: '',
  guidelines: 'Fleischner Society Guidelines (2024)',
  symptoms: [],
  uploadedFiles: [],
  roiBox: null,
  setClinicalSuspicions: (suspicions) => set({ clinicalSuspicions: suspicions }),
  setRoi: (roi) => set({ roi }),
  setGuidelines: (guidelines) => set({ guidelines }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  setRoiBox: (box) => set({ roiBox: box }),
}))
