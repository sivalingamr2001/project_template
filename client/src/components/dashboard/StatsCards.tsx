import { useData } from '../../context/DataContext';
import { useApp } from "@/hooks/useApp"
import { Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export function StatsCards() {
  const { requests } = useData();
  const { currentRole } = useApp();

  const getPendingCount = () => {
    if (currentRole === 'HOD') {
      return requests.filter(r => r.items.some(i => i.status === 'PendingHOD')).length;
    }
    if (currentRole === 'IT') {
      return requests.filter(r => r.items.some(i => i.status === 'PendingIT')).length;
    }
    return 0;
  };

  const getApprovedTodayCount = () => {
    const today = new Date().toDateString();
    return requests.filter(r =>
      r.approvalTimeline.some(a =>
        new Date(a.timestamp).toDateString() === today && ['HODApproved', 'ITApproved', 'AccessGranted'].includes(a.action)
      )
    ).length;
  };

  const getExpiringCount = () => {
    return requests.flatMap(r => r.items).filter(item => {
      if (item.status !== 'Approved') return false;
      const daysLeft = Math.ceil(
        (new Date(item.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft > 0 && daysLeft <= 30;
    }).length;
  };

  const getRevokedCount = () => {
    return requests.flatMap(r => r.items).filter(i => i.status === 'Revoked').length;
  };

  const stats = [
    {
      label: 'Pending Approvals',
      value: getPendingCount(),
      icon: <Clock className="text-yellow-600" size={24} />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      label: 'Approved Today',
      value: getApprovedTodayCount(),
      icon: <CheckCircle className="text-green-600" size={24} />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Expiring Within 30 Days',
      value: getExpiringCount(),
      icon: <AlertCircle className="text-orange-600" size={24} />,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      label: 'Revoked Access',
      value: getRevokedCount(),
      icon: <Trash2 className="text-red-600" size={24} />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
