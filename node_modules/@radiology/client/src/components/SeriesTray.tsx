import { useStore } from '../stores/useStore'

interface SeriesTrayProps {
  seriesId?: string
}

export function SeriesTray({ seriesId }: SeriesTrayProps) {
  const { selectedInstanceId, setSelectedInstance } = useStore()

  const seriesGroups = [
    {
      id: 'chest',
      label: 'Chest',
      instances: [
        { id: 'i1', num: 1 },
        { id: 'i2', num: 2 },
        { id: 'i3', num: 3 },
        { id: 'i4', num: 4 },
        { id: 'i5', num: 5 },
        { id: 'i6', num: 6 },
        { id: 'i7', num: 7 },
        { id: 'i8', num: 8 },
      ],
    },
    {
      id: 'lung',
      label: 'Lung',
      instances: [
        { id: 'i9', num: 1 },
        { id: 'i10', num: 2 },
        { id: 'i11', num: 3 },
        { id: 'i12', num: 4 },
      ],
    },
    {
      id: 'bone',
      label: 'Bone',
      instances: [
        { id: 'i13', num: 1 },
        { id: 'i14', num: 2 },
        { id: 'i15', num: 3 },
      ],
    },
  ]

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-800 w-16 shrink-0">
      {/* Series tabs */}
      <div className="flex flex-col gap-0.5 p-1 border-b border-slate-800">
        {seriesGroups.map((group) => (
          <button
            key={group.id}
            className={`text-[9px] font-medium px-1.5 py-1 rounded text-center transition-colors ${
              seriesId === group.id
                ? 'bg-medical-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Thumbnails */}
      <div className="flex-1 overflow-y-auto p-1 space-y-1">
        {seriesGroups[0].instances.map((inst) => (
          <button
            key={inst.id}
            onClick={() => setSelectedInstance(inst.id)}
            className={`w-full aspect-square rounded border-2 transition-all flex items-center justify-center ${
              selectedInstanceId === inst.id
                ? 'border-medical-500 bg-medical-950/30'
                : 'border-slate-700 bg-slate-800 hover:border-slate-500'
            }`}
          >
            <span className="text-[9px] text-slate-500 font-mono">{inst.num}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
