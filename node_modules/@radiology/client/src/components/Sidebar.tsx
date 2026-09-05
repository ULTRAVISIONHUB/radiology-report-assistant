import {
  User,
  Users,
  Monitor,
  FileText,
  LayoutTemplate,
  History,
  Settings,
} from 'lucide-react'
import { useStore } from '../stores/useStore'

const navItems = [
  { id: 'patients' as const, label: 'Patients', icon: Users },
  { id: 'patient' as const, label: 'Patient', icon: User },
  { id: 'viewer' as const, label: 'Viewer', icon: Monitor },
  { id: 'report' as const, label: 'Report', icon: FileText },
  { id: 'templates' as const, label: 'Templates', icon: LayoutTemplate },
  { id: 'history' as const, label: 'History', icon: History },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { activePanel, setActivePanel, sidebarOpen } = useStore()

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-16' : 'w-0'
      } bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 gap-1 shrink-0 transition-all duration-200 overflow-hidden`}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePanel === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
              isActive
                ? 'bg-medical-950 text-medical-400'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
            <span
              className={`text-[9px] mt-0.5 font-medium ${
                isActive ? 'text-medical-400' : 'text-slate-500 group-hover:text-slate-300'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-medical-500 rounded-r" />
            )}
          </button>
        )
      })}
    </aside>
  )
}
