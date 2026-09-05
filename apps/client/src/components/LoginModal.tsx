import { useState } from 'react'
import { LogIn, User, Shield, Activity } from 'lucide-react'
import { useStore } from '../stores/useStore'

const demoUsers = [
  { email: 'resident@medivision.com', password: 'demo123', name: 'Dr. Resident', role: 'resident' as const, department: 'Radiology' },
  { email: 'attending@medivision.com', password: 'demo123', name: 'Dr. Attending', role: 'attending' as const, department: 'Radiology' },
  { email: 'admin@medivision.com', password: 'demo123', name: 'Admin User', role: 'admin' as const, department: 'IT' },
]

export function LoginModal() {
  const { login, isAuthenticated } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('resident')
  const [error, setError] = useState('')

  if (isAuthenticated) return null

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const matched = demoUsers.find((u) => u.email === email && u.password === password)
    if (matched) {
      login({
        id: crypto.randomUUID(),
        email: matched.email,
        name: matched.name,
        role: matched.role,
        department: matched.department,
      })
    } else {
      setError('Invalid email or password.')
    }
  }

  const handleDemoLogin = (demoUser: (typeof demoUsers)[0]) => {
    login({
      id: crypto.randomUUID(),
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      department: demoUser.department,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4">
          <div className="w-14 h-14 rounded-xl bg-medical-600 flex items-center justify-center mb-3">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">MediVision Pro</h1>
          <p className="text-xs text-slate-400 mt-1">Radiology Report Assistant</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="px-6 pb-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="w-full rounded-md bg-slate-800 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-medical-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-medical-500"
            >
              <option value="resident">Resident</option>
              <option value="attending">Attending</option>
              <option value="admin">Administrator</option>
              <option value="technologist">Technologist</option>
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-red-950/50 border border-red-900 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-medical-600 text-white text-sm font-semibold hover:bg-medical-500 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative px-6 py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase">Or use demo account</span>
          </div>
        </div>

        {/* Demo buttons */}
        <div className="px-6 pb-8 space-y-2">
          {demoUsers.map((u) => (
            <button
              key={u.email}
              onClick={() => handleDemoLogin(u)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-slate-800 border border-slate-700 hover:border-medical-700 hover:bg-slate-750 transition-colors text-left"
            >
              <Shield className="w-4 h-4 text-medical-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-200">{u.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {u.role} · {u.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
