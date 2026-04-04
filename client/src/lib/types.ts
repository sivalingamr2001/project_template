// User and role types
export type UserRole = 'EMPLOYEE' | 'HOD' | 'IT_INFRA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

// Request status types
export type RequestStatus = 'PENDING' | 'HOD_APPROVED' | 'IT_APPROVED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REJECTED';
export type AccessItemStatus = 'PENDING' | 'APPROVED_HOD' | 'APPROVED_IT' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REJECTED';

// Access item types
export interface AccessItem {
  id: string;
  system: string;
  accessType: string;
  requestedAt: string;
  expiresAt: string;
  status: AccessItemStatus;
  approvalHistory: ApprovalRecord[];
}

// Approval record for audit trail
export interface ApprovalRecord {
  id: string;
  approverRole: 'HOD' | 'IT_INFRA';
  approverId: string;
  approverName: string;
  action: 'APPROVED' | 'REJECTED';
  comment?: string;
  timestamp: string;
  previousStatus?: AccessItemStatus;
}

// Main request type
export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterDept: string;
  requestedAt: string;
  items: AccessItem[];
  status: RequestStatus;
  rejectionReason?: string;
  approvalTimeline: ApprovalRecord[];
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  role: UserRole;
  type: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRING_SOON' | 'EXPIRED';
  requestId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Filter and sort types
export interface RequestFilters {
  status?: RequestStatus[];
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface SortOptions {
  field: 'requestedAt' | 'expiresAt' | 'status';
  order: 'asc' | 'desc';
}

// Analytics types
export interface AnalyticsData {
  totalRequests: number;
  pendingRequests: number;
  approvedToday: number;
  expiringWithin30Days: number;
  revokedCount: number;
  approvalTrend: Array<{
    date: string;
    count: number;
  }>;
}
