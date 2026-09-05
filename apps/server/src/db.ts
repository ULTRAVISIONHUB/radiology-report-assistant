import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const DB_DIR = path.resolve(process.cwd(), 'data')
const DB_FILE = path.join(DB_DIR, 'db.json')

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// In-memory database
interface Database {
  users: any[]
  patients: any[]
  studies: any[]
  reports: any[]
  report_history: any[]
  templates: any[]
  audit_events: any[]
  critical_findings: any[]
}

let db: Database = {
  users: [],
  patients: [],
  studies: [],
  reports: [],
  report_history: [],
  templates: [],
  audit_events: [],
  critical_findings: [],
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8')
      db = JSON.parse(data)
    }
  } catch (e) {
    console.log('No existing database, starting fresh')
  }
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

export function initDatabase() {
  loadDb()
  seedDatabase()
  saveDb()
  console.log('In-memory database initialized')
}

function seedDatabase() {
  if (db.users.length > 0) return

  const passwordHash = bcrypt.hashSync('demo123', 10)

  db.users.push(
    { id: uuidv4(), email: 'resident@medivision.com', password_hash: passwordHash, name: 'Dr. Resident', role: 'resident', department: 'Radiology', created_at: new Date().toISOString() },
    { id: uuidv4(), email: 'attending@medivision.com', password_hash: passwordHash, name: 'Dr. Attending', role: 'attending', department: 'Radiology', created_at: new Date().toISOString() },
    { id: uuidv4(), email: 'admin@medivision.com', password_hash: passwordHash, name: 'Admin User', role: 'admin', department: 'IT', created_at: new Date().toISOString() }
  )

  db.templates.push(
    { id: uuidv4(), name: 'Normal Chest CT', modality: 'CT', body_part: 'Chest', technique: 'CT chest with IV contrast. Images acquired in helical mode with 1.25mm slice thickness.', normal_findings: 'The lungs are clear without focal consolidation, pleural effusion, or pneumothorax. The mediastinum is unremarkable.', normal_impression: 'No acute cardiopulmonary abnormality.', sections: '[]', created_by: 'system', created_at: new Date().toISOString() },
    { id: uuidv4(), name: 'Normal Brain MRI', modality: 'MRI', body_part: 'Brain', technique: 'MRI brain with and without gadolinium. Sequences include T1, T2, FLAIR, DWI, and ADC.', normal_findings: 'Normal brain parenchyma without mass effect, midline shift, or abnormal signal.', normal_impression: 'Normal MRI brain.', sections: '[]', created_by: 'system', created_at: new Date().toISOString() },
    { id: uuidv4(), name: 'Normal Abdominal US', modality: 'US', body_part: 'Abdomen', technique: 'Ultrasound of the abdomen with graded compression.', normal_findings: 'Liver, gallbladder, pancreas, spleen, and kidneys are unremarkable. No free fluid.', normal_impression: 'Normal abdominal ultrasound.', sections: '[]', created_by: 'system', created_at: new Date().toISOString() },
    { id: uuidv4(), name: 'Normal Chest X-Ray', modality: 'XR', body_part: 'Chest', technique: 'PA and lateral chest radiographs.', normal_findings: 'The lungs are clear. Cardiomediastinal silhouette is normal. No pleural effusion or pneumothorax.', normal_impression: 'Normal chest radiograph.', sections: '[]', created_by: 'system', created_at: new Date().toISOString() }
  )

  console.log('Seed data inserted')
}

// CRUD helpers
export function insert(table: keyof Database, record: any) {
  if (!record.id) record.id = uuidv4()
  if (!record.created_at) record.created_at = new Date().toISOString()
  db[table].push(record)
  saveDb()
  return record
}

export function findAll(table: keyof Database, filters?: Record<string, any>) {
  let results = db[table]
  if (filters) {
    results = results.filter(r =>
      Object.entries(filters).every(([key, val]) => r[key] === val)
    )
  }
  return results
}

export function findOne(table: keyof Database, filters: Record<string, any>) {
  return db[table].find(r =>
    Object.entries(filters).every(([key, val]) => r[key] === val)
  )
}

export function findById(table: keyof Database, id: string) {
  return db[table].find(r => r.id === id)
}

export function update(table: keyof Database, id: string, updates: Record<string, any>) {
  const idx = db[table].findIndex(r => r.id === id)
  if (idx === -1) return null
  db[table][idx] = { ...db[table][idx], ...updates, updated_at: new Date().toISOString() }
  saveDb()
  return db[table][idx]
}

export function remove(table: keyof Database, id: string) {
  const idx = db[table].findIndex(r => r.id === id)
  if (idx === -1) return false
  db[table].splice(idx, 1)
  saveDb()
  return true
}

export function getDb() {
  return db
}
