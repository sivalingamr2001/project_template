import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetBreakdownTable } from '@/components/reports/BudgetBreakdownTable'
import { BudgetVarianceChart } from '@/components/reports/BudgetVarianceChart'
import { PhaseProgressTracker } from '@/components/reports/PhaseProgressTracker'
import { PeriodToggle } from '@/components/reports/PeriodToggle'
import { ProjectSelector } from '@/components/reports/ProjectSelector'
import type {
  ReportPeriod,
  BudgetRecord,
} from '@/types/budget'
import {
  useProjectBudget,
  useProjectBudgets,
  useMonthlyTrend,
  useQuarterlyTrend,
  useYearlyTrend,
} from '@/hooks/useBudgetData'

const periodOptions: ReportPeriod[] = ['monthly', 'quarterly', 'yearly']

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

function calculateSummary(budgets: BudgetRecord[]) {
  const planned = budgets.flatMap((budget) => budget.lineItems).reduce((sum, item) => sum + item.plannedAmount, 0)
  const actual = budgets.flatMap((budget) => budget.lineItems).reduce((sum, item) => sum + item.actualAmount, 0)
  const variance = planned - actual
  const variancePct = planned ? (variance / planned) * 100 : 0
  const utilisationPct = planned ? (actual / planned) * 100 : 0

  return {
    totalPlanned: planned,
    totalActual: actual,
    variance,
    variancePct,
    utilisationPct,
    activeProjects: budgets.filter((budget) => budget.status === 'active').length,
  }
}

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

const reportPhases = [
  'Product Design',
  'Concept Development',
  'Prototype Development',
  'Product Testing',
  'Capital Equipment',
  'Field Validation',
] as const

export default function ReportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectQuery = searchParams.get('project') ?? 'all'
  const periodQuery = (searchParams.get('period') as ReportPeriod) ?? 'monthly'

  const budgets = useProjectBudgets()
  const availableProjects = useMemo(
    () => budgets.map((budget) => budget.projectNumber),
    [budgets]
  )

  const selectedBudget = projectQuery !== 'all' ? useProjectBudget(projectQuery) : undefined
  const filteredBudgets = selectedBudget ? [selectedBudget] : budgets

  const summary = useMemo(() => calculateSummary(filteredBudgets), [filteredBudgets])
  const monthlyTrend = useMonthlyTrend(selectedBudget?.projectNumber)
  const quarterlyTrend = useQuarterlyTrend(selectedBudget?.projectNumber)
  const yearlyTrend = useYearlyTrend(selectedBudget?.projectNumber)
  const trendData = periodQuery === 'monthly' ? monthlyTrend : periodQuery === 'quarterly' ? quarterlyTrend : yearlyTrend

  const breakdown = useMemo<BreakdownGroup[]>(() => {
    const rows: Map<string, BreakdownRow> = new Map()
    filteredBudgets.flatMap((budget) => budget.lineItems).forEach((item) => {
      const key = `${item.category}-${item.subcategory}`
      const existing = rows.get(key)
      const planned = item.plannedAmount
      const actual = item.actualAmount
      const variance = planned - actual
      const variancePct = planned ? (variance / planned) * 100 : 0
      const utilisationPct = planned ? (actual / planned) * 100 : 0

      if (existing) {
        rows.set(key, {
          ...existing,
          planned: existing.planned + planned,
          actual: existing.actual + actual,
          variance: existing.variance + variance,
          variancePct: existing.planned + planned ? ((existing.variance + variance) / (existing.planned + planned)) * 100 : 0,
          utilisationPct: existing.planned + planned ? ((existing.actual + actual) / (existing.planned + planned)) * 100 : 0,
        })
      } else {
        rows.set(key, {
          category: item.category,
          subcategory: item.subcategory,
          planned,
          actual,
          variance,
          variancePct,
          utilisationPct,
        })
      }
    })

    const grouped = new Map<string, BreakdownGroup>()
    rows.forEach((row) => {
      const group = grouped.get(row.category) ?? {
        category: row.category,
        subtotalPlanned: 0,
        subtotalActual: 0,
        subtotalVariance: 0,
        subtotalPct: 0,
        rows: [],
      }

      group.rows.push(row)
      group.subtotalPlanned += row.planned
      group.subtotalActual += row.actual
      group.subtotalVariance += row.variance
      grouped.set(row.category, group)
    })

    const result = Array.from(grouped.values()).map((group) => ({
      ...group,
      subtotalPct: group.subtotalPlanned ? (group.subtotalVariance / group.subtotalPlanned) * 100 : 0,
    }))

    return result
  }, [filteredBudgets])

  const phaseStats = useMemo(
    () =>
      reportPhases.map((phase) => {
        const phaseBudgets = filteredBudgets.filter((budget) => budget.phase === phase)
        const planned = phaseBudgets.flatMap((budget) => budget.lineItems).reduce((sum, item) => sum + item.plannedAmount, 0)
        const actual = phaseBudgets.flatMap((budget) => budget.lineItems).reduce((sum, item) => sum + item.actualAmount, 0)
        const utilisationPct = planned ? (actual / planned) * 100 : 0
        const status = phaseBudgets.length
          ? phaseBudgets.some((budget) => budget.status === 'complete')
            ? ('Complete' as const)
            : ('In Progress' as const)
          : ('Not Started' as const)

        return {
          name: phase,
          planned,
          actual,
          utilisationPct,
          status,
          isActive: status === 'In Progress',
        }
      }),
    [filteredBudgets]
  )

  const handleProjectChange = (project: string) => {
    const params = new URLSearchParams(searchParams)
    if (project === 'all') {
      params.delete('project')
    } else {
      params.set('project', project)
    }
    setSearchParams(params)
  }

  const handlePeriodChange = (period: ReportPeriod) => {
    const params = new URLSearchParams(searchParams)
    params.set('period', period)
    setSearchParams(params)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/" className="underline-offset-4 hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <span>Reports</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">Budget Analysis Report</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProjectSelector
            projects={availableProjects}
            selected={projectQuery}
            onChange={handleProjectChange}
          />
          <Button variant="outline" onClick={() => {}}>
            Export PDF / Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-border bg-background">
          <CardContent className="space-y-1 px-4 py-5">
            <div className="text-sm text-muted-foreground">Total Planned Budget</div>
            <div className="text-2xl font-semibold text-slate-100">{formatCurrency(summary.totalPlanned)}</div>
            <div className="text-sm text-slate-400">Filtered by period and project</div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-background">
          <CardContent className="space-y-1 px-4 py-5">
            <div className="text-sm text-muted-foreground">Total Actual Spent</div>
            <div className="text-2xl font-semibold text-slate-100">{formatCurrency(summary.totalActual)}</div>
            <div className="text-sm text-slate-400">Oracle ERP synced amounts</div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-background">
          <CardContent className="space-y-1 px-4 py-5">
            <div className="text-sm text-muted-foreground">Overall Variance</div>
            <div className="text-2xl font-semibold text-slate-100">
              <span className={summary.variance >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {formatCurrency(summary.variance)}
              </span>
            </div>
            <div className="text-sm text-slate-400">{formatPercent(summary.variancePct)}</div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-background">
          <CardContent className="space-y-1 px-4 py-5">
            <div className="text-sm text-muted-foreground">Active NPD Projects</div>
            <div className="text-2xl font-semibold text-slate-100">{summary.activeProjects}</div>
            <div className="text-sm text-slate-400">Projects in active execution</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border bg-background p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Report window</p>
            <p className="text-xs text-slate-400">Mode: {periodQuery.charAt(0).toUpperCase() + periodQuery.slice(1)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodToggle selected={periodQuery} options={periodOptions} onChange={handlePeriodChange} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetVarianceChart data={trendData.map((point) => ({
          label: point.label,
          planned: point.planned,
          actual: point.actual,
          variancePct: point.planned ? ((point.planned - point.actual) / point.planned) * 100 : 0,
        }))}
        />
        <Card className="border border-border bg-background p-4">
          <CardHeader className="px-0 pb-4 pt-0">
            <CardTitle className="text-base font-semibold">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-0 pb-0 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Total Planned</div>
                <div className="mt-2 text-xl font-semibold text-slate-100">{formatCurrency(summary.totalPlanned)}</div>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Total Actual</div>
                <div className="mt-2 text-xl font-semibold text-slate-100">{formatCurrency(summary.totalActual)}</div>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Variance</div>
                <div className={`mt-2 text-xl font-semibold ${summary.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(summary.variance)}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Utilisation</div>
                <div className="mt-2 text-xl font-semibold text-slate-100">{formatPercent(summary.utilisationPct)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <BudgetBreakdownTable groups={breakdown} />
        <PhaseProgressTracker phases={phaseStats} />
      </div>
    </div>
  )
}
