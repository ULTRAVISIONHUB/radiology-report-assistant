export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth: string;
  age: number;
  sex: 'M' | 'F' | 'O';
  accessionNumber: string;
  referringPhysician: string;
  department: string;
  clinicalPriority: 'routine' | 'urgent' | 'stat';
  allergies: string;
  contrastSensitivity: boolean;
  renalFunction: {
    egfr: number;
    creatinine: number;
  };
  careSetting: string;
}

export interface Study {
  id: string;
  patientId: string;
  modality: string;
  studyDescription: string;
  studyDate: string;
  series: Series[];
  status: 'pending' | 'in-progress' | 'preliminary' | 'final' | 'amended';
  priority: 'routine' | 'urgent' | 'stat';
}

export interface Series {
  id: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  instances: Instance[];
}

export interface Instance {
  id: string;
  instanceNumber: number;
  sopClassUid: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface Report {
  id: string;
  studyId: string;
  patientId: string;
  radiologistId: string;
  radiologistName: string;
  status: 'draft' | 'preliminary' | 'final' | 'amended';
  clinicalHistory: string;
  clinicalIndication: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations: string;
  criticalFindings: boolean;
  criticalFindingsText?: string;
  comparisonStudyId?: string;
  comparisonText?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
  amendedAt?: string;
  amendedBy?: string;
  version: number;
  reviewedBy?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewComments?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  modality: string;
  bodyPart: string;
  technique: string;
  normalFindings: string;
  normalImpression: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'measurement';
  options?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'resident' | 'attending' | 'admin' | 'technologist';
  licenseNumber?: string;
  department: string;
  signature?: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface CriticalFinding {
  id: string;
  reportId: string;
  studyId: string;
  finding: string;
  severity: 'critical' | 'urgent' | 'unexpected';
  notified: boolean;
  notifiedAt?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface Measurement {
  id: string;
  instanceId: string;
  type: 'length' | 'area' | 'angle' | 'density';
  points: { x: number; y: number }[];
  value: number;
  unit: string;
  label: string;
}

export interface VoiceDictationState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  language: string;
  error?: string;
}
