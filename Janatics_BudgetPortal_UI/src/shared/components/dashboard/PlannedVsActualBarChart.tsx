import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface TrendPoint {
  label: string
  planned: number
  actual: number
  variance: number
}

interface PlannedVsActualBarChartProps {
  data: TrendPoint[]
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
}

export function PlannedVsActualBarChart({
  data,
}: PlannedVsActualBarChartProps) {
  return (
    <Card className="h-full">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-base font-semibold">
          Planned vs Actual
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[380px] px-4 pt-1 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend wrapperStyle={{ color: "#6b7280", fontSize: 12 }} />
            <Bar
              dataKey="planned"
              name="Planned"
              fill="#1a56db"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="actual"
              name="Actual"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
