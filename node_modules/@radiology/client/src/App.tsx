import { useState } from 'react'
import { useStore } from './stores/useStore'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ImageViewer } from './components/ImageViewer'
import { ReportPanel } from './components/ReportPanel'
import { PatientForm } from './components/PatientForm'
import { PatientList } from './components/PatientList'
import { VoiceDictation } from './components/VoiceDictation'
import { CriticalFindingsAlert } from './components/CriticalFindingsAlert'
import { TemplatesPanel } from './components/TemplatesPanel'
import { ReportHistory } from './components/ReportHistory'
import { LoginModal } from './components/LoginModal'
import { SettingsPanel } from './components/SettingsPanel'
import { Toaster } from 'react-hot-toast'

function App() {
  const { isAuthenticated, activePanel } = useStore()
  const [showLogin, setShowLogin] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoginModal />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
        }} />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left: Image Viewer */}
          <div className="flex-1 flex flex-col min-w-0">
            <ImageViewer />
          </div>
          
          {/* Right: Panel based on active selection */}
          <div className="w-[480px] flex-shrink-0 border-l border-slate-800 bg-slate-950 overflow-y-auto">
            {activePanel === 'patient' && <PatientForm />}
            {activePanel === 'patients' && <PatientList />}
            {activePanel === 'report' && <ReportPanel />}
            {activePanel === 'templates' && <TemplatesPanel />}
            {activePanel === 'history' && <ReportHistory />}
            {activePanel === 'settings' && <SettingsPanel />}
            {activePanel === 'viewer' && (
              <div className="p-6 text-slate-400 text-center">
                <p className="text-sm">Select an image from the series tray below to begin analysis</p>
                <p className="text-xs text-slate-600 mt-2">Or drag & drop images/videos onto the viewer</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Floating Voice Dictation */}
      <VoiceDictation />
      
      {/* Critical Findings Alert */}
      <CriticalFindingsAlert />
      
      {showLogin && <LoginModal />}
      
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
      }} />
    </div>
  )
}

export default App
