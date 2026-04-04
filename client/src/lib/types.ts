// User and role types
export type UserRole = 'EMPLOYEE' | 'HOD' | 'IT_INFRA';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  location?: string;
  phone?: string;
}

// Request status types
export type RequestStatus = 'PENDING' | 'HOD_APPROVED' | 'IT_APPROVED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REJECTED';
export type AccessItemStatus = 'PENDING' | 'APPROVED_HOD' | 'APPROVED_IT' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REJECTED';

// Access item types
export interface AccessItem {
  id: number;
  system: string;
  accessType: string;
  requestedAt: string;
  expiresAt: string;
  status: AccessItemStatus;
  approvalHistory: ApprovalRecord[];
}

// Approval record for audit trail
export interface ApprovalRecord {
  id: number;
  approverRole: 'HOD' | 'IT_INFRA';
  approverId: number;
  approverName: string;
  action: 'APPROVED' | 'REJECTED';
  comment?: string;
  timestamp: string;
  previousStatus?: AccessItemStatus;
}

// Main request type
export interface AccessRequest {
  id: number;
  requesterId: number;
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
  id: number;
  userId: number;
  role: UserRole;
  type: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRING_SOON' | 'EXPIRED';
  requestid: number;
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
