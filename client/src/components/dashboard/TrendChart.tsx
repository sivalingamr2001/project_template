import { useData } from "../../context/DataContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function TrendChart() {
  const { requests } = useData()

  const today = new Date()
  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (6 - index))
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    const approvedCount = requests.filter((request) =>
      request.approvalTimeline.some(
        (entry) =>
          new Date(entry.timestamp).toDateString() === date.toDateString() &&
          ["HODApproved", "ITApproved"].includes(entry.action)
      )
    ).length

    const rejectedCount = requests.filter((request) =>
      request.approvalTimeline.some(
        (entry) =>
          new Date(entry.timestamp).toDateString() === date.toDateString() &&
          ["HODRejected", "ITRejected"].includes(entry.action)
      )
    ).length

    return {
      date: dateStr,
      Approved: approvedCount,
      Rejected: rejectedCount,
    }
  })

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h3 className="mb-4 text-lg font-bold">Approval Trend (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
          <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
            }}
          />
          <Legend />
          <Bar dataKey="Approved" fill="#22c55e" />
          <Bar dataKey="Rejected" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
