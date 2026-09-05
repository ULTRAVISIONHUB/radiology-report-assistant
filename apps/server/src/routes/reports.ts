import { Router } from 'express'
import { findAll, findById, insert, update, remove } from '../db.js'
import { authenticateToken } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

router.use(authenticateToken)

// GET /api/reports
router.get('/', (req: AuthenticatedRequest, res) => {
  const { status, patientId, studyId } = req.query

  const filters: Record<string, any> = {}
  if (status) filters.status = status
  if (patientId) filters.patient_id = patientId
  if (studyId) filters.study_id = studyId

  let reports = findAll('reports', Object.keys(filters).length > 0 ? filters : undefined)
  reports = reports.sort(
    (a: any, b: any) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
  )

  res.json({ reports })
})

// GET /api/reports/:id
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const report = findById('reports', req.params.id)
  if (!report) {
    res.status(404).json({ error: 'Report not found' })
    return
  }
  res.json({ report })
})

// POST /api/reports
router.post('/', (req: AuthenticatedRequest, res) => {
  const {
    studyId,
    patientId,
    clinicalHistory,
    clinicalIndication,
    technique,
    findings,
    impression,
    recommendations,
    criticalFindings,
    criticalFindingsText,
    comparisonStudyId,
    comparisonText,
  } = req.body

  if (!studyId || !patientId) {
    res.status(400).json({ error: 'studyId and patientId required' })
    return
  }

  const now = new Date().toISOString()

  const report = insert('reports', {
    study_id: studyId,
    patient_id: patientId,
    radiologist_id: req.user!.id,
    radiologist_name: req.user!.name,
    status: 'draft',
    clinical_history: clinicalHistory || '',
    clinical_indication: clinicalIndication || '',
    technique: technique || '',
    findings: findings || '',
    impression: impression || '',
    recommendations: recommendations || '',
    critical_findings: criticalFindings ? 1 : 0,
    critical_findings_text: criticalFindingsText || '',
    comparison_study_id: comparisonStudyId || '',
    comparison_text: comparisonText || '',
    updated_at: now,
    version: 1,
  })

  res.status(201).json({ report })
})

// PUT /api/reports/:id
router.put('/:id', (req: AuthenticatedRequest, res) => {
  const existing = findById('reports', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Report not found' })
    return
  }

  const {
    clinicalHistory,
    clinicalIndication,
    technique,
    findings,
    impression,
    recommendations,
    criticalFindings,
    criticalFindingsText,
    comparisonStudyId,
    comparisonText,
  } = req.body

  const now = new Date().toISOString()

  const updates: Record<string, any> = {
    clinical_history: clinicalHistory ?? existing.clinical_history,
    clinical_indication: clinicalIndication ?? existing.clinical_indication,
    technique: technique ?? existing.technique,
    findings: findings ?? existing.findings,
    impression: impression ?? existing.impression,
    recommendations: recommendations ?? existing.recommendations,
    critical_findings_text: criticalFindingsText ?? existing.critical_findings_text,
    comparison_study_id: comparisonStudyId ?? existing.comparison_study_id,
    comparison_text: comparisonText ?? existing.comparison_text,
    updated_at: now,
  }

  if (criticalFindings !== undefined) {
    updates.critical_findings = criticalFindings ? 1 : 0
  } else {
    updates.critical_findings = existing.critical_findings
  }

  const report = update('reports', req.params.id, updates)

  // Save to history
  insert('report_history', {
    report_id: req.params.id,
    version: existing.version,
    status: existing.status,
    clinical_history: existing.clinical_history,
    clinical_indication: existing.clinical_indication,
    technique: existing.technique,
    findings: existing.findings,
    impression: existing.impression,
    recommendations: existing.recommendations,
    critical_findings: existing.critical_findings,
    author_id: req.user!.id,
    author_name: req.user!.name,
  })

  res.json({ report })
})

// POST /api/reports/:id/finalize
router.post('/:id/finalize', (req: AuthenticatedRequest, res) => {
  const existing = findById('reports', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Report not found' })
    return
  }

  if (req.user!.role !== 'attending' && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Only attending or admin can finalize reports' })
    return
  }

  const now = new Date().toISOString()

  const report = update('reports', req.params.id, {
    status: 'final',
    finalized_at: now,
    version: (existing.version || 0) + 1,
  })

  res.json({ report })
})

// POST /api/reports/:id/amend
router.post('/:id/amend', (req: AuthenticatedRequest, res) => {
  const existing = findById('reports', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Report not found' })
    return
  }

  if (req.user!.role !== 'attending' && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Only attending or admin can amend reports' })
    return
  }

  const now = new Date().toISOString()

  const report = update('reports', req.params.id, {
    status: 'amended',
    amended_at: now,
    amended_by: req.user!.name,
    version: (existing.version || 0) + 1,
  })

  res.json({ report })
})

// POST /api/reports/:id/review
router.post('/:id/review', (req: AuthenticatedRequest, res) => {
  const { status, comments } = req.body
  const existing = findById('reports', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Report not found' })
    return
  }

  if (req.user!.role !== 'attending' && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Only attending or admin can review reports' })
    return
  }

  const now = new Date().toISOString()

  const report = update('reports', req.params.id, {
    review_status: status,
    review_comments: comments || '',
    reviewed_by: req.user!.name,
    updated_at: now,
  })

  res.json({ report })
})

// GET /api/reports/:id/history
router.get('/:id/history', (req: AuthenticatedRequest, res) => {
  const history = findAll('report_history', { report_id: req.params.id }).sort(
    (a: any, b: any) => (b.version || 0) - (a.version || 0)
  )
  res.json({ history })
})

export { router as reportsRouter }
