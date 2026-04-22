import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BudgetRecord } from '@/types/budget'

interface TopVarianceProjectsProps {
  budgets: BudgetRecord[]
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

export function TopVarianceProjects({ budgets }: TopVarianceProjectsProps) {
  const navigate = useNavigate()

  const rows = useMemo(() => {
    return budgets
      .map((budget) => {
        const planned = budget.lineItems.reduce((sum, item) => sum + item.plannedAmount, 0)
        const actual = budget.lineItems.reduce((sum, item) => sum + item.actualAmount, 0)
        const variance = planned - actual
        return {
          ...budget,
          planned,
          actual,
          variance,
          absVariance: Math.abs(variance),
        }
      })
      .sort((a, b) => b.absVariance - a.absVariance)
      .slice(0, 5)
  }, [budgets])

  return (
    <Card className="h-full">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-base font-semibold text-slate-100">Top Variance Projects</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-4 pb-4 pt-1">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="py-3 pr-4">Project No</th>
              <th className="py-3 pr-4">Product Name</th>
              <th className="py-3 pr-4">Phase</th>
              <th className="py-3 pr-4">Planned</th>
              <th className="py-3 pr-4">Actual</th>
              <th className="py-3 pr-4">Variance</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.projectNumber}
                className="cursor-pointer border-b border-slate-700 hover:bg-slate-900"
                onClick={() => navigate(`/reports?project=${row.projectNumber}&period=monthly`)}
              >
                <td className="py-3 pr-4 font-medium text-slate-100">{row.projectNumber}</td>
                <td className="py-3 pr-4">{row.productName}</td>
                <td className="py-3 pr-4 text-slate-400">{row.phase}</td>
                <td className="py-3 pr-4">{formatCurrency(row.planned)}</td>
                <td className="py-3 pr-4">{formatCurrency(row.actual)}</td>
                <td className="py-3 pr-4 text-slate-100">
                  <span className={row.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {formatCurrency(row.variance)}
                  </span>
                </td>
                <td className="py-3">
                  <Badge variant={row.status === 'active' ? 'secondary' : row.status === 'over-budget' ? 'destructive' : 'outline'}>
                    {row.status === 'over-budget' ? 'Over Budget' : row.status === 'active' ? 'Active' : row.status === 'complete' ? 'Complete' : 'Draft'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
