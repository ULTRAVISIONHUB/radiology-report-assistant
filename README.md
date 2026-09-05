# MediVision Pro — Professional Radiology Report Assistant

A production-grade radiology reporting application built with React 19, TypeScript, Node.js, and integrated AI assistance.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or the Kimi Desktop bundled Node runtime)

### 1. Start the Backend Server

```bash
cd apps/server
npm install
npm run dev
```

Server runs on **http://localhost:3001**

### 2. Start the Frontend Client

```bash
cd apps/client
npm install
npm run dev
```

Client runs on **http://localhost:5173**

### 3. Demo Login

Use any of these demo accounts (password: `demo123`):

| Email | Role | Permissions |
|-------|------|-------------|
| `resident@medivision.com` | Resident | Create preliminary reports, view studies |
| `attending@medivision.com` | Attending | Finalize reports, review resident work |
| `admin@medivision.com` | Administrator | Full system access, user management |

---

## 📁 Project Structure

```
radiology-report-assistant/
├── apps/
│   ├── client/           # React 19 + Vite + Tailwind CSS frontend
│   │   ├── src/
│   │   │   ├── components/    # 16 React components
│   │   │   ├── stores/        # Zustand state management
│   │   │   ├── types/         # TypeScript interfaces
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── dist/              # Production build
│   └── server/           # Express + TypeScript backend
│       ├── src/
│       │   ├── routes/        # API routes (auth, patients, studies, reports, templates, audit)
│       │   ├── middleware/    # JWT auth, RBAC
│       │   ├── db.ts          # In-memory JSON database
│       │   └── index.ts       # Express server entry
│       └── data/              # JSON database persistence
```

---

## ✨ Features Implemented

### 🏥 Clinical Workflow

| Feature | Description |
|---------|-------------|
| **Patient Demographics** | Full patient form: MRN, DOB, age/sex, allergies, eGFR, creatinine, care setting |
| **Study Management** | Modality, study description, accession number, clinical priority (Routine/Urgent/Stat) |
| **DICOM-Style Viewer** | Canvas-based image viewer with zoom, pan, window/level, measurements |
| **Series Tray** | Thumbnail navigation between instances |

### 📝 Structured Reporting

| Feature | Description |
|---------|-------------|
| **ACR-Style Templates** | Pre-built templates for Chest CT, Brain MRI, Abdominal US, Chest X-Ray |
| **Report Sections** | Clinical History, Indication, Technique, Findings, Impression, Recommendations |
| **Status Workflow** | Draft → Preliminary → Final → Amended |
| **Critical Findings** | Flag critical results with severity levels |
| **Prior Comparison** | Compare with previous studies |
| **Version History** | Full audit trail of report changes |

### 🤖 AI Assistance

| Feature | Description |
|---------|-------------|
| **AI Report Generation** | Simulated Gemini-powered structured report generation |
| **Clinical Guidelines** | Built-in Fleischner Society 2024, ACR, RECIST references |
| **AI Chatbot** | Grounded clinical second opinion consultation |

### 🎤 Voice Dictation

| Feature | Description |
|---------|-------------|
| **Web Speech API** | Real-time speech-to-text in 5 languages |
| **Visual Waveform** | Animated audio waveform during recording |
| **Insert at Cursor** | Transcribe directly into report fields |

### 👥 Peer Review Workflow

| Feature | Description |
|---------|-------------|
| **Resident → Attending** | Preliminary reports require attending sign-off |
| **Approve/Reject** | Review with comments and discrepancy tracking |
| **Electronic Signature** | Sign-off with user identity |

### 📄 Export & Compliance

| Feature | Description |
|---------|-------------|
| **PDF Export** | Professional formatted reports with header, demographics, signature block |
| **Audit Trail** | Immutable log of all system actions |
| **CSV Export** | Audit log export for compliance review |

### 🔐 Security & Roles

| Role | Permissions |
|------|-------------|
| **Resident** | Create preliminary reports, view studies, use AI assistant |
| **Attending** | Finalize reports, review resident work, amend reports |
| **Admin** | User management, template creation, full audit access |
| **Technologist** | Upload studies, view patient data |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Zustand |
| **Backend** | Express, TypeScript, Node.js |
| **Database** | In-memory JSON (auto-persisted to `data/db.json`) |
| **Auth** | JWT with bcrypt |
| **PDF** | jsPDF |
| **Voice** | Web Speech API |
| **Icons** | Lucide React |

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/me` | GET | Current user |
| `/api/patients` | GET/POST | Patient CRUD |
| `/api/studies` | GET/POST | Study CRUD + DICOM upload |
| `/api/reports` | GET/POST | Report CRUD |
| `/api/reports/:id/finalize` | POST | Finalize report |
| `/api/reports/:id/amend` | POST | Amend report |
| `/api/reports/:id/review` | POST | Peer review |
| `/api/templates` | GET/POST | Report templates |
| `/api/audit` | GET | Audit log |

---

## 🔄 Production Readiness Checklist

To deploy this in a real clinical environment, you would need:

- [ ] **HIPAA Compliance**: BAAs, encryption at rest/transit, access controls
- [ ] **FDA 510(k) Clearance**: Clinical validation study
- [ ] **PACS Integration**: DICOMweb (WADO-RS, QIDO-RS) for image retrieval
- [ ] **EHR Integration**: HL7 FHIR R4 for patient demographics sync
- [ ] **Voice Dictation**: Nuance Dragon Medical One or Whisper Medical integration
- [ ] **PostgreSQL Database**: Replace in-memory JSON with production database
- [ ] **Redis Cache**: For session management and caching
- [ ] **Load Balancing**: For high availability
- [ ] **Backup & Recovery**: Automated database backups
- [ ] **SOC 2 Type II**: Security audit certification

---

## 📄 License

For educational and research purposes. Not intended for clinical use without proper regulatory clearance.

---

Built with ❤️ for radiologists everywhere.
