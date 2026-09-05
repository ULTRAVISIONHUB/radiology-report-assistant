import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { findOne, insert } from '../db.js'
import { generateToken, authenticateToken } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' })
    return
  }

  const user = findOne('users', { email })

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = bcrypt.compareSync(password, user.password_hash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
  })

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    },
  })
})

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, name, role, department } = req.body

  if (!email || !password || !name || !role) {
    res.status(400).json({ error: 'Email, password, name, and role required' })
    return
  }

  const existing = findOne('users', { email })
  if (existing) {
    res.status(409).json({ error: 'Email already registered' })
    return
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const id = uuidv4()

  insert('users', {
    id,
    email,
    password_hash: passwordHash,
    name,
    role,
    department: department || 'Radiology',
  })

  const token = generateToken({ id, email, name, role, department: department || 'Radiology' })

  res.status(201).json({
    token,
    user: { id, email, name, role, department: department || 'Radiology' },
  })
})

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  res.json({ user: req.user })
})

export { router as authRouter }
