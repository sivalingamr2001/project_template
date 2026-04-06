import { Badge } from '../../ui/badge';

const variantMap: Record<string, string> = {
  RequestCreated: 'bg-blue-100 text-blue-800',
  HODApproved: 'bg-cyan-100 text-cyan-800',
  ITApproved: 'bg-indigo-100 text-indigo-800',
  AccessGranted: 'bg-green-100 text-green-800',
  Revoked: 'bg-red-100 text-red-800',
  Expired: 'bg-muted text-muted-foreground',
};

export function AuditActionTag({ action }: { action: string }) {
  return <Badge className={variantMap[action] ?? 'bg-muted text-foreground'}>{action}</Badge>;
}
