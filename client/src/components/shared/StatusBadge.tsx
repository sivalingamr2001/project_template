import type { RequestStatus, AccessItemStatus } from '../../lib/types';
import { STATUS_CONFIG } from '../../lib/constants';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus | AccessItemStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const paddingClass = size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-sm';

  const getIcon = () => {
    switch (status) {
      case 'PendingHOD':
      case 'PendingIT':
        return <Clock size={iconSize} className="mr-1" />;
      case 'Approved':
        return <CheckCircle size={iconSize} className="mr-1" />;
      case 'Rejected':
      case 'Revoked':
        return <XCircle size={iconSize} className="mr-1" />;
      case 'Expired':
        return <AlertCircle size={iconSize} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center rounded-full ${paddingClass} ${config.bgColor} ${config.color} font-medium`}>
      {getIcon()}
      {config.label}
    </div>
  );
}
