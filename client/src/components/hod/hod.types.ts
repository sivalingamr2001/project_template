import type { AccessItemStatus, AccessTypes } from '@/lib/types';

export interface AccessListItem {
  id: number;
  employeeName: string;
  empId: number;
  folderName: string;
  accessType: AccessTypes;
  status: AccessItemStatus;
}

export interface ApprovalItem extends AccessListItem {
  requestId: number;
  detailId: number;
  approvalId: number;
  reason?: string;
  itsrNumber?: string;
}

export interface EmployeeLookupResult {
  empId: number;
  empName: string;
  department: string;
  active: number;
  pending: number;
  expired: number;
  accesses: AccessListItem[];
}

export const hodKeys = {
  pending: () => ['hod', 'pending'] as const,
  history: () => ['hod', 'history'] as const,
  employeeLookup: (empId: number) => ['hod', 'employee', empId] as const,
};
