import { Router } from 'express'
import { findAll, insert, getDb } from '../db.js'
import { authenticateToken } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

router.use(authenticateToken)

// GET /api/audit
router.get('/', (req: AuthenticatedRequest, res) => {
  const { userId, action, resourceType, dateFrom, dateTo, limit = '100', offset = '0' } = req.query

  let events = findAll('audit_events')

  if (userId) {
    events = events.filter((e: any) => e.user_id === userId)
  }
  if (action) {
    events = events.filter((e: any) => e.action === action)
  }
  if (resourceType) {
    events = events.filter((e: any) => e.resource_type === resourceType)
  }
  if (dateFrom) {
    const from = new Date(dateFrom as string).getTime()
    events = events.filter((e: any) => new Date(e.timestamp || e.created_at).getTime() >= from)
  }
  if (dateTo) {
    const to = new Date(dateTo + 'T23:59:59').getTime()
    events = events.filter((e: any) => new Date(e.timestamp || e.created_at).getTime() <= to)
  }

  events = events.sort(
    (a: any, b: any) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
  )

  const limitNum = Number(limit)
  const offsetNum = Number(offset)
  const paginated = events.slice(offsetNum, offsetNum + limitNum)

  res.json({ events: paginated, total: events.length })
})

// POST /api/audit (internal use — log an event)
router.post('/', (req: AuthenticatedRequest, res) => {
  const { action, resourceType, resourceId, details } = req.body

  if (!action || !resourceType || !resourceId) {
    res.status(400).json({ error: 'action, resourceType, and resourceId required' })
    return
  }

  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown'

  insert('audit_events', {
    user_id: req.user!.id,
    user_name: req.user!.name,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details || '',
    ip_address: ipAddress,
    timestamp: new Date().toISOString(),
  })

  res.status(201).json({ message: 'Audit event logged' })
})

// GET /api/audit/summary
router.get('/summary', (_req: AuthenticatedRequest, res) => {
  const db = getDb()
  const events = db.audit_events || []

  const counts: Record<string, number> = {}
  for (const event of events) {
    const action = event.action || 'unknown'
    counts[action] = (counts[action] || 0) + 1
  }

  const summary = Object.entries(counts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)

  res.json({ summary })
})

export { router as auditRouter }
