import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PhaseStats {
  name: string
  planned: number
  actual: number
  utilisationPct: number
  status: 'Complete' | 'In Progress' | 'Not Started'
  isActive: boolean
}

interface PhaseProgressTrackerProps {
  phases: PhaseStats[]
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

function progressWidthClass(utilisation: number) {
  if (utilisation >= 100) return 'w-full'
  if (utilisation >= 75) return 'w-3/4'
  if (utilisation >= 50) return 'w-1/2'
  if (utilisation >= 25) return 'w-1/4'
  return 'w-1/6'
}

export function PhaseProgressTracker({ phases }: PhaseProgressTrackerProps) {
  return (
    <Card className="border border-border bg-background">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-base font-semibold">Phase Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 px-4 pb-4 pt-1 sm:grid-cols-2 xl:grid-cols-3">
        {phases.map((phase) => (
          <div
            key={phase.name}
            className={cn(
              'rounded-3xl border p-4 shadow-sm',
              phase.isActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-700 bg-slate-950'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{phase.name}</p>
                <p className="mt-2 text-xs text-slate-400">Planned: {formatCurrency(phase.planned)}</p>
                <p className="text-xs text-slate-400">Actual: {formatCurrency(phase.actual)}</p>
              </div>
              <Badge
                variant={
                  phase.status === 'Complete'
                    ? 'secondary'
                    : phase.status === 'In Progress'
                    ? 'default'
                    : 'outline'
                }
              >
                {phase.status}
              </Badge>
            </div>
            <div className="mt-4 text-sm font-medium text-slate-100">
              {Math.round(phase.utilisationPct)}% utilised
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-800">
              <div className={`h-full rounded-full bg-emerald-500 ${progressWidthClass(phase.utilisationPct)}`} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
