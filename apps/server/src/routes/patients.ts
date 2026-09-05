import { Router } from 'express'
import { findAll, findOne, findById, insert, update, remove } from '../db.js'
import { authenticateToken } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

router.use(authenticateToken)

// GET /api/patients
router.get('/', (_req: AuthenticatedRequest, res) => {
  const patients = findAll('patients').sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  res.json({ patients })
})

// GET /api/patients/search?q=...
router.get('/search', (req: AuthenticatedRequest, res) => {
  const { q } = req.query
  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Query parameter q required' })
    return
  }

  const search = q.toLowerCase()
  const patients = findAll('patients').filter(
    (p: any) =>
      (p.mrn && p.mrn.toLowerCase().includes(search)) ||
      (p.name && p.name.toLowerCase().includes(search))
  )
  res.json({ patients })
})

// GET /api/patients/:id
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const patient = findById('patients', req.params.id)
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }
  res.json({ patient })
})

// POST /api/patients
router.post('/', (req: AuthenticatedRequest, res) => {
  const {
    mrn,
    name,
    dateOfBirth,
    age,
    sex,
    accessionNumber,
    referringPhysician,
    department,
    clinicalPriority,
    allergies,
    contrastSensitivity,
    egfr,
    creatinine,
    careSetting,
  } = req.body

  if (!mrn || !name || !dateOfBirth) {
    res.status(400).json({ error: 'MRN, name, and dateOfBirth required' })
    return
  }

  const patient = insert('patients', {
    mrn,
    name,
    date_of_birth: dateOfBirth,
    age: age || 0,
    sex: sex || 'O',
    accession_number: accessionNumber || '',
    referring_physician: referringPhysician || '',
    department: department || '',
    clinical_priority: clinicalPriority || 'routine',
    allergies: allergies || '',
    contrast_sensitivity: contrastSensitivity ? 1 : 0,
    egfr: egfr || 0,
    creatinine: creatinine || 0,
    care_setting: careSetting || 'outpatient',
  })

  res.status(201).json({ patient })
})

// PUT /api/patients/:id
router.put('/:id', (req: AuthenticatedRequest, res) => {
  const existing = findById('patients', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const fields: Record<string, string> = {
    mrn: 'mrn',
    name: 'name',
    dateOfBirth: 'date_of_birth',
    age: 'age',
    sex: 'sex',
    accessionNumber: 'accession_number',
    referringPhysician: 'referring_physician',
    department: 'department',
    clinicalPriority: 'clinical_priority',
    allergies: 'allergies',
    egfr: 'egfr',
    creatinine: 'creatinine',
    careSetting: 'care_setting',
  }

  const updates: Record<string, any> = {}

  for (const [bodyField, dbField] of Object.entries(fields)) {
    if (req.body[bodyField] !== undefined) {
      updates[dbField] = req.body[bodyField]
    }
  }

  if (req.body.contrastSensitivity !== undefined) {
    updates.contrast_sensitivity = req.body.contrastSensitivity ? 1 : 0
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' })
    return
  }

  const patient = update('patients', req.params.id, updates)
  res.json({ patient })
})

// DELETE /api/patients/:id
router.delete('/:id', (req: AuthenticatedRequest, res) => {
  const existing = findById('patients', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  remove('patients', req.params.id)
  res.json({ message: 'Patient deleted' })
})

export { router as patientsRouter }
