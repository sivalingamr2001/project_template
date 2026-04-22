import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BudgetVarianceChartPoint {
  label: string
  planned: number
  actual: number
  variancePct: number
}

interface BudgetVarianceChartProps {
  data: BudgetVarianceChartPoint[]
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

export function BudgetVarianceChart({ data }: BudgetVarianceChartProps) {
  return (
    <Card className="h-full">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-base font-semibold">Budget Variance Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[420px] px-4 pb-4 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tickFormatter={formatCurrency}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatPercent}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) =>
                name === 'Variance %'
                  ? formatPercent(Number(value))
                  : formatCurrency(Number(value))
              }
            />
            <Legend wrapperStyle={{ color: '#6b7280', fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="planned" name="Planned" fill="#1a56db" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="left" dataKey="actual" name="Actual" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="variancePct"
              name="Variance %"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
