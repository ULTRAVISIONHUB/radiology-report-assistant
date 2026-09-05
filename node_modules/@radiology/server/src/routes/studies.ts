import { Router } from 'express'
import multer from 'multer'
import { findAll, findById, insert, update, remove } from '../db.js'
import { authenticateToken } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()
const upload = multer({ dest: 'uploads/dicom/' })

router.use(authenticateToken)

// GET /api/studies
router.get('/', (_req: AuthenticatedRequest, res) => {
  const studies = findAll('studies').sort(
    (a: any, b: any) => new Date(b.study_date).getTime() - new Date(a.study_date).getTime()
  )
  res.json({ studies })
})

// GET /api/studies/:id
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const study = findById('studies', req.params.id)
  if (!study) {
    res.status(404).json({ error: 'Study not found' })
    return
  }
  res.json({ study })
})

// POST /api/studies
router.post('/', (req: AuthenticatedRequest, res) => {
  const { patientId, modality, studyDescription, studyDate, priority } = req.body

  if (!patientId || !modality || !studyDate) {
    res.status(400).json({ error: 'patientId, modality, and studyDate required' })
    return
  }

  const study = insert('studies', {
    patient_id: patientId,
    modality,
    study_description: studyDescription || '',
    study_date: studyDate,
    status: 'pending',
    priority: priority || 'routine',
  })

  res.status(201).json({ study })
})

// PUT /api/studies/:id
router.put('/:id', (req: AuthenticatedRequest, res) => {
  const existing = findById('studies', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Study not found' })
    return
  }

  const { modality, studyDescription, studyDate, status, priority } = req.body
  const updates: Record<string, any> = {}

  if (modality !== undefined) updates.modality = modality
  if (studyDescription !== undefined) updates.study_description = studyDescription
  if (studyDate !== undefined) updates.study_date = studyDate
  if (status !== undefined) updates.status = status
  if (priority !== undefined) updates.priority = priority

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' })
    return
  }

  const study = update('studies', req.params.id, updates)
  res.json({ study })
})

// DELETE /api/studies/:id
router.delete('/:id', (req: AuthenticatedRequest, res) => {
  const existing = findById('studies', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Study not found' })
    return
  }

  remove('studies', req.params.id)
  res.json({ message: 'Study deleted' })
})

// POST /api/studies/:id/upload
router.post('/:id/upload', upload.single('dicom'), (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  const study = findById('studies', req.params.id)
  if (!study) {
    res.status(404).json({ error: 'Study not found' })
    return
  }

  const fileInfo = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
  }

  res.json({
    message: 'File uploaded successfully',
    file: fileInfo,
    studyId: req.params.id,
  })
})

// GET /api/studies/:id/metadata
router.get('/:id/metadata', (req: AuthenticatedRequest, res) => {
  const study = findById('studies', req.params.id)
  if (!study) {
    res.status(404).json({ error: 'Study not found' })
    return
  }

  const mockMetadata = {
    studyInstanceUid: `1.2.840.${req.params.id}`,
    patientName: 'Demo Patient',
    patientId: study.patient_id,
    studyDate: study.study_date,
    modality: study.modality,
    studyDescription: study.study_description,
    seriesCount: 3,
    instanceCount: 42,
    manufacturer: 'Demo Manufacturer',
    stationName: 'CT-SCANNER-01',
  }

  res.json({ metadata: mockMetadata })
})

export { router as studiesRouter }
