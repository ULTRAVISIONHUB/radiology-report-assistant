import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { initDatabase } from './db.js'
import { authRouter } from './routes/auth.js'
import { patientsRouter } from './routes/patients.js'
import { studiesRouter } from './routes/studies.js'
import { reportsRouter } from './routes/reports.js'
import { templatesRouter } from './routes/templates.js'
import { auditRouter } from './routes/audit.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Logging
app.use(morgan('combined'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Stricter limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later.' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Initialize database
initDatabase()

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/patients', patientsRouter)
app.use('/api/studies', studiesRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/templates', templatesRouter)
app.use('/api/audit', auditRouter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MediVision Pro server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
