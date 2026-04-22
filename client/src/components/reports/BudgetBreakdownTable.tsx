import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Lock } from 'lucide-react'

interface BreakdownRow {
  category: string
  subcategory: string
  planned: number
  actual: number
  variance: number
  variancePct: number
  utilisationPct: number
}

interface BreakdownGroup {
  category: string
  subtotalPlanned: number
  subtotalActual: number
  subtotalVariance: number
  subtotalPct: number
  rows: BreakdownRow[]
}

interface BudgetBreakdownTableProps {
  groups: BreakdownGroup[]
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function BudgetBreakdownTable({ groups }: BudgetBreakdownTableProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const initial: Record<string, boolean> = {}
    groups.forEach((group, index) => {
      initial[group.category] = index === 0
    })
    setOpenGroups(initial)
  }, [groups])

  const totals = groups.reduce(
    (acc, group) => {
      acc.planned += group.subtotalPlanned
      acc.actual += group.subtotalActual
      acc.variance += group.subtotalVariance
      return acc
    },
    { planned: 0, actual: 0, variance: 0 }
  )

  return (
    <Card className="border border-border bg-background">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-base font-semibold">Audit Table</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden px-4 pb-4 pt-1">
        <div className="grid gap-4">
          <div className="grid grid-cols-[2fr_2fr_1.25fr_1.25fr_1.25fr_1fr] items-center gap-4 rounded-3xl bg-slate-950 px-4 py-4 text-sm font-semibold text-white">
            <span>Category</span>
            <span>Subcategory</span>
            <span>Planned</span>
            <span>Actual</span>
            <span>Variance</span>
            <span className="text-right">Variance %</span>
          </div>

          {groups.map((group) => (
            <div key={group.category} className="rounded-3xl border border-slate-700 bg-slate-950 shadow-sm">
              <Collapsible
                open={openGroups[group.category]}
                onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [group.category]: open }))}
              >
                <div className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4 text-slate-100">
                  <div>
                    <div className="text-sm font-semibold">{group.category}</div>
                    <div className="mt-1 text-xs text-slate-400">{group.rows.length} subcategories</div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{formatCurrency(group.subtotalPlanned)} planned</span>
                    <span>{formatCurrency(group.subtotalActual)} actual</span>
                    <Badge variant={group.subtotalVariance >= 0 ? 'secondary' : 'destructive'}>
                      {formatPercent(group.subtotalPct)}
                    </Badge>
                    <CollapsibleTrigger asChild>
                      <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 transition hover:bg-slate-700">
                        {openGroups[group.category] ? 'Hide' : 'Show'}
                      </button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="space-y-3 border-t border-slate-700 px-4 py-4">
                    <div className="grid gap-2 text-sm text-slate-300">
                      {group.rows.map((row) => (
                        <div
                          key={`${row.category}-${row.subcategory}`}
                          className="grid grid-cols-[2fr_2fr_1.25fr_1.25fr_1.25fr_1fr] items-center gap-4 rounded-3xl bg-slate-900 px-4 py-3"
                        >
                          <span className="text-slate-100">{row.category}</span>
                          <span className="text-slate-400">{row.subcategory}</span>
                          <span className="font-medium text-slate-100">{formatCurrency(row.planned)}</span>
                          <span className="flex items-center gap-2 text-slate-100">
                            {formatCurrency(row.actual)}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                                  <Lock className="h-3.5 w-3.5" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={4}>
                                Synced from Oracle ERP — read only
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className={row.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {formatCurrency(row.variance)}
                          </span>
                          <span className={row.variance >= 0 ? 'text-emerald-600 text-right' : 'text-rose-600 text-right'}>
                            {formatPercent(row.variancePct)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}

          <div className="grid grid-cols-[2fr_2fr_1.25fr_1.25fr_1.25fr_1fr] items-center gap-4 rounded-3xl bg-slate-950 px-4 py-4 text-sm font-semibold text-white">
            <span>Grand Total</span>
            <span />
            <span>{formatCurrency(totals.planned)}</span>
            <span>{formatCurrency(totals.actual)}</span>
            <span className={totals.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(totals.variance)}</span>
            <span className={totals.variance >= 0 ? 'text-emerald-400 text-right' : 'text-rose-400 text-right'}>
              {totals.planned ? `${((totals.variance / totals.planned) * 100).toFixed(1)}%` : '0.0%'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
