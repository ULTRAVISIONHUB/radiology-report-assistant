import { useState } from 'react'
import { Settings, Key, Save, Check, AlertTriangle, RotateCcw, Database, Loader2 } from 'lucide-react'
import { useStore } from '../stores/useStore'

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast, efficient multimodal' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Most capable reasoning' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', desc: 'Next-gen fast multimodal' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'General purpose' },
]

export function SettingsPanel() {
  const { currentUser, pacsConfig, setPacsConfig } = useStore()
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '')
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('gemini_model') || 'gemini-2.5-flash')
  const [reportLanguage, setReportLanguage] = useState(localStorage.getItem('report_language') || 'en')
  const [institutionName, setInstitutionName] = useState(localStorage.getItem('institution_name') || '')
  const [autoSave, setAutoSave] = useState(localStorage.getItem('auto_save') !== 'false')
  const [showCriticalAlert, setShowCriticalAlert] = useState(localStorage.getItem('show_critical_alert') !== 'false')
  const [saved, setSaved] = useState(false)

  const [testingPacs, setTestingPacs] = useState(false)
  const [pacsTestResult, setPacsTestResult] = useState<null | { ok: boolean; message: string }>(null)

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey)
    localStorage.setItem('gemini_model', selectedModel)
    localStorage.setItem('report_language', reportLanguage)
    localStorage.setItem('institution_name', institutionName)
    localStorage.setItem('auto_save', autoSave.toString())
    localStorage.setItem('show_critical_alert', showCriticalAlert.toString())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      localStorage.removeItem('gemini_api_key')
      localStorage.removeItem('gemini_model')
      localStorage.removeItem('report_language')
      localStorage.removeItem('institution_name')
      localStorage.removeItem('auto_save')
      localStorage.removeItem('show_critical_alert')
      localStorage.removeItem('pacs_config')
      setApiKey('')
      setSelectedModel('gemini-2.5-flash')
      setReportLanguage('en')
      setInstitutionName('')
      setAutoSave(true)
      setShowCriticalAlert(true)
      setPacsConfig({ enabled: false, serverUrl: '', wadoUrl: '', qidoUrl: '', username: '', password: '' })
    }
  }

  const handleTestConnection = async () => {
    setTestingPacs(true)
    setPacsTestResult(null)
    try {
      const baseUrl = pacsConfig.qidoUrl || pacsConfig.serverUrl
      if (!baseUrl) {
        setPacsTestResult({ ok: false, message: 'Please enter a Server URL or QIDO-RS URL.' })
        return
      }
      const url = new URL('/studies', baseUrl).toString()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, { method: 'GET', signal: controller.signal, headers: { Accept: 'application/dicom+json' } })
      clearTimeout(timeout)
      if (res.ok) {
        setPacsTestResult({ ok: true, message: 'Connection successful.' })
      } else {
        setPacsTestResult({ ok: false, message: `Connection failed: ${res.status} ${res.statusText}` })
      }
    } catch (err: any) {
      setPacsTestResult({ ok: false, message: err?.message || 'Unable to reach PACS server.' })
    } finally {
      setTestingPacs(false)
    }
  }

  const hasApiKey = apiKey.length > 0

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <Settings className="w-5 h-5 text-medical-400" />
        <h2 className="text-sm font-semibold text-slate-100">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Gemini API Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-medical-400" />
            <h3 className="text-sm font-semibold text-slate-200">Gemini AI Configuration</h3>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Gemini API Key</label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google AI Studio API key..."
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 font-mono"
              />
              {hasApiKey && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Get your key from{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-medical-400 hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">AI Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.desc}
                </option>
              ))}
            </select>
          </div>

          {!hasApiKey && (
            <div className="rounded-md bg-amber-950/30 border border-amber-800 px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">
                AI report generation requires a Gemini API key. Add your key above to enable AI features.
              </p>
            </div>
          )}
        </div>

        {/* Report Settings */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Report Preferences</h3>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Default Report Language</label>
            <select
              value={reportLanguage}
              onChange={(e) => setReportLanguage(e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Institution Name (for PDF header)</label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g., General Hospital Radiology Dept"
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
          </div>
        </div>

        {/* Workflow Settings */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Workflow</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-medical-500"
            />
            <div>
              <span className="text-sm text-slate-200">Auto-save reports</span>
              <p className="text-[10px] text-slate-500">Automatically save draft every 30 seconds</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showCriticalAlert}
              onChange={(e) => setShowCriticalAlert(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-medical-500"
            />
            <div>
              <span className="text-sm text-slate-200">Critical findings alerts</span>
              <p className="text-[10px] text-slate-500">Show banner and sound for critical results</p>
            </div>
          </label>
        </div>

        {/* PACS Integration */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-medical-400" />
            <h3 className="text-sm font-semibold text-slate-200">PACS Integration (DICOMweb)</h3>
          </div>

          <p className="text-[10px] text-slate-500">
            Connect to Orthanc, DCMTK, or any DICOMweb-compatible PACS.
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pacsConfig.enabled}
              onChange={(e) => setPacsConfig({ enabled: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-medical-500"
            />
            <div>
              <span className="text-sm text-slate-200">Enable PACS Integration</span>
              <p className="text-[10px] text-slate-500">Fetch studies and images from a DICOMweb server</p>
            </div>
          </label>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Server URL</label>
            <input
              type="text"
              value={pacsConfig.serverUrl}
              onChange={(e) => setPacsConfig({ serverUrl: e.target.value })}
              placeholder="e.g., http://localhost:8042/dicom-web"
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">WADO-RS URL</label>
            <input
              type="text"
              value={pacsConfig.wadoUrl}
              onChange={(e) => setPacsConfig({ wadoUrl: e.target.value })}
              placeholder="e.g., http://localhost:8042/dicom-web/wado-rs"
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">QIDO-RS URL</label>
            <input
              type="text"
              value={pacsConfig.qidoUrl}
              onChange={(e) => setPacsConfig({ qidoUrl: e.target.value })}
              placeholder="e.g., http://localhost:8042/dicom-web/qido-rs"
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Username</label>
              <input
                type="text"
                value={pacsConfig.username}
                onChange={(e) => setPacsConfig({ username: e.target.value })}
                placeholder="PACS username"
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Password</label>
              <input
                type="password"
                value={pacsConfig.password}
                onChange={(e) => setPacsConfig({ password: e.target.value })}
                placeholder="PACS password"
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
              />
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testingPacs || !pacsConfig.enabled}
            className={`w-full py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              pacsConfig.enabled
                ? 'bg-medical-600 hover:bg-medical-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {testingPacs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {testingPacs ? 'Testing…' : 'Test Connection'}
          </button>

          {pacsTestResult && (
            <div
              className={`rounded-md border px-3 py-2 flex items-start gap-2 ${
                pacsTestResult.ok
                  ? 'bg-emerald-950/30 border-emerald-800'
                  : 'bg-red-950/30 border-red-800'
              }`}
            >
              {pacsTestResult.ok ? (
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              )}
              <p className={`text-xs ${pacsTestResult.ok ? 'text-emerald-300' : 'text-red-300'}`}>
                {pacsTestResult.message}
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">Current User</h3>
            <div className="rounded-md bg-slate-900 border border-slate-700 p-3 space-y-1">
              <p className="text-sm text-slate-200">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <p className="text-xs text-slate-400 capitalize">Role: {currentUser.role}</p>
              <p className="text-xs text-slate-400">Department: {currentUser.department}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 space-y-2">
        <button
          onClick={handleSave}
          className={`w-full py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-medical-600 hover:bg-medical-500 text-white'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          className="w-full py-2 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
