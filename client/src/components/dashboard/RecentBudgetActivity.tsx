import { Trophy, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ActivityItem {
  projectNumber: string
  productName: string
  category: string
  oldAmount: number
  newAmount: number
  timestamp: string
}

const recentActivities: ActivityItem[] = [
  {
    projectNumber: 'NPD-2025-01',
    productName: 'Smart Home Hub',
    category: 'Hardware budget',
    oldAmount: 4200000,
    newAmount: 4500000,
    timestamp: '2025-03-29T09:40:00Z',
  },
  {
    projectNumber: 'NPD-2025-02',
    productName: 'Autonomous Drone',
    category: 'Field testing',
    oldAmount: 1780000,
    newAmount: 1900000,
    timestamp: '2025-03-28T17:05:00Z',
  },
  {
    projectNumber: 'NPD-2025-03',
    productName: 'Urban Electric Scooter',
    category: 'Battery plan',
    oldAmount: 1980000,
    newAmount: 2050000,
    timestamp: '2025-03-27T14:22:00Z',
  },
  {
    projectNumber: 'NPD-2025-01',
    productName: 'Smart Home Hub',
    category: 'Testing scope',
    oldAmount: 980000,
    newAmount: 1040000,
    timestamp: '2025-03-26T11:12:00Z',
  },
  {
    projectNumber: 'NPD-2025-02',
    productName: 'Autonomous Drone',
    category: 'Control systems',
    oldAmount: 2100000,
    newAmount: 2200000,
    timestamp: '2025-03-26T09:05:00Z',
  },
]

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RecentBudgetActivity() {
  return (
    <Card className="h-full">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-base font-semibold">Recent Budget Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 pt-1">
        <TooltipProvider delayDuration={100}>
          {recentActivities.map((item) => (
            <div key={`${item.projectNumber}-${item.timestamp}`} className="rounded-3xl border border-slate-700 bg-slate-950 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Trophy className="h-4 w-4 text-slate-400" />
                    <span>{item.projectNumber}</span>
                  </div>
                  <p className="text-sm text-slate-600">{item.productName}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                      <Lock className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={4}>
                    Synced from Oracle ERP — read only
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950 p-3 text-sm text-slate-300 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Category</div>
                  <div className="mt-1 font-medium text-slate-100">{item.category}</div>
                </div>
                <div className="rounded-2xl bg-slate-950 p-3 text-sm text-slate-300 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Old vs New</div>
                  <div className="mt-1 text-slate-100">
                    {formatCurrency(item.oldAmount)} → {formatCurrency(item.newAmount)}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">{formatTimestamp(item.timestamp)}</p>
            </div>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
