import type { ApprovalItem, EmployeeLookupResult } from '../hod/hod.types';

export interface AuditLogItem {
  id: number;
  action: string;
  actor: string;
  createdOn: string;
}

export type ITQueueItem = ApprovalItem;
export type ActiveAccessItem = ApprovalItem & { expiresAt?: string };
export type ITEmployeeLookupResult = EmployeeLookupResult;

export const itKeys = {
  queue: () => ['it', 'queue'] as const,
  activeAccess: () => ['it', 'active'] as const,
  employeeLookup: (empId: string) => ['it', 'employee', empId] as const,
  auditLog: (filter: string) => ['it', 'auditLog', filter] as const,
};
