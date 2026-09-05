import { useState } from 'react'
import {
  Activity,
  LogOut,
  ShieldAlert,
  Circle,
  ChevronDown,
} from 'lucide-react'
import { useStore } from '../stores/useStore'

export function Header() {
  const { currentUser, logout, criticalFindings } = useStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const unacknowledgedCount = criticalFindings.filter((f) => !f.acknowledged).length
  const isOnline = true

  const roleBadgeColor: Record<string, string> = {
    resident: 'bg-blue-600',
    attending: 'bg-emerald-600',
    admin: 'bg-purple-600',
    technologist: 'bg-amber-600',
  }

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
      {/* Logo / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-medical-600 text-white">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">
            MediVision Pro
          </h1>
          <p className="text-[10px] text-slate-400 -mt-0.5">Radiology Report Assistant</p>
        </div>
      </div>

      {/* Center: Critical Alert */}
      {unacknowledgedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-400 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {unacknowledgedCount} Critical Finding{unacknowledgedCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800">
          <Circle className={`w-2.5 h-2.5 fill-current ${isOnline ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="text-xs text-slate-300">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* User */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-medical-700 flex items-center justify-center text-xs font-bold text-white">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-slate-200 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5 capitalize">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${roleBadgeColor[currentUser.role] || 'bg-slate-600'}`}
              >
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-xl z-50">
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-sm font-medium text-slate-200">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setShowUserMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
