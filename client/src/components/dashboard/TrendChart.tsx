import { useData } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TrendChart() {
  const { requests } = useData();

  // Generate last 7 days trend
  const today = new Date();
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const approvedCount = requests.filter(r =>
      r.approvalTimeline.some(a =>
        new Date(a.timestamp).toDateString() === date.toDateString() && a.action === 'APPROVED'
      )
    ).length;

    const rejectedCount = requests.filter(r =>
      r.approvalTimeline.some(a =>
        new Date(a.timestamp).toDateString() === date.toDateString() && a.action === 'REJECTED'
      )
    ).length;

    return {
      date: dateStr,
      Approved: approvedCount,
      Rejected: rejectedCount,
    };
  });

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="font-bold text-lg mb-4">Approval Trend (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
          <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
            }}
          />
          <Legend />
          <Bar dataKey="Approved" fill="#22c55e" />
          <Bar dataKey="Rejected" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
