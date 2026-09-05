import { Router } from 'express'
import { findAll, findById, insert, update, remove } from '../db.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

router.use(authenticateToken)

// GET /api/templates
router.get('/', (_req: AuthenticatedRequest, res) => {
  const { modality, bodyPart } = _req.query

  let templates = findAll('templates')

  if (modality) {
    templates = templates.filter((t: any) => t.modality === modality)
  }
  if (bodyPart) {
    const search = (bodyPart as string).toLowerCase()
    templates = templates.filter((t: any) => t.body_part && t.body_part.toLowerCase().includes(search))
  }

  templates = templates.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''))

  res.json({ templates })
})

// GET /api/templates/:id
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const template = findById('templates', req.params.id)
  if (!template) {
    res.status(404).json({ error: 'Template not found' })
    return
  }
  res.json({ template })
})

// POST /api/templates (admin/attending only)
router.post('/', requireRole('admin', 'attending'), (req: AuthenticatedRequest, res) => {
  const { name, modality, bodyPart, technique, normalFindings, normalImpression, sections } = req.body

  if (!name || !modality || !bodyPart) {
    res.status(400).json({ error: 'name, modality, and bodyPart required' })
    return
  }

  const template = insert('templates', {
    name,
    modality,
    body_part: bodyPart,
    technique: technique || '',
    normal_findings: normalFindings || '',
    normal_impression: normalImpression || '',
    sections: sections ? JSON.stringify(sections) : '[]',
    created_by: req.user!.id,
  })

  res.status(201).json({ template })
})

// PUT /api/templates/:id (admin/attending only)
router.put('/:id', requireRole('admin', 'attending'), (req: AuthenticatedRequest, res) => {
  const existing = findById('templates', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Template not found' })
    return
  }

  const { name, modality, bodyPart, technique, normalFindings, normalImpression, sections } = req.body
  const updates: Record<string, any> = {}

  if (name !== undefined) updates.name = name
  if (modality !== undefined) updates.modality = modality
  if (bodyPart !== undefined) updates.body_part = bodyPart
  if (technique !== undefined) updates.technique = technique
  if (normalFindings !== undefined) updates.normal_findings = normalFindings
  if (normalImpression !== undefined) updates.normal_impression = normalImpression
  if (sections !== undefined) updates.sections = JSON.stringify(sections)

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' })
    return
  }

  const template = update('templates', req.params.id, updates)
  res.json({ template })
})

// DELETE /api/templates/:id (admin only)
router.delete('/:id', requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const existing = findById('templates', req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Template not found' })
    return
  }

  remove('templates', req.params.id)
  res.json({ message: 'Template deleted' })
})

export { router as templatesRouter }
