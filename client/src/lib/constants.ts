import type { AccessItemStatus, RequestStatus } from './types';

// Status colors and labels
export const STATUS_CONFIG: Record<RequestStatus | AccessItemStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending HOD', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  HOD_APPROVED: { label: 'Pending IT', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  APPROVED_HOD: { label: 'Pending IT', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  IT_APPROVED: { label: 'IT Approved', color: 'text-green-700', bgColor: 'bg-green-50' },
  APPROVED_IT: { label: 'IT Approved', color: 'text-green-700', bgColor: 'bg-green-50' },
  ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-50' },
  EXPIRED: { label: 'Expired', color: 'text-gray-700', bgColor: 'bg-gray-50' },
  REVOKED: { label: 'Revoked', color: 'text-red-700', bgColor: 'bg-red-50' },
  REJECTED: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50' },
};

// Common systems
export const SYSTEMS = [
  'AWS Console',
  'Azure Portal',
  'GitHub Enterprise',
  'Salesforce',
  'ServiceNow',
  'Jira',
  'Confluence',
  'Jenkins',
  'DataDog',
  'Slack',
];

// Access types
export const ACCESS_TYPES = [
  'View Only',
  'Editor',
  'Admin',
  'Developer',
  'Project Lead',
];

// Days until expiry warnings
export const EXPIRY_WARNING_DAYS = 30;
export const MAX_ACCESS_DAYS = 365;

// Mock users
export const MOCK_USERS = {
  employee: {
    id: 'emp-001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'EMPLOYEE' as const,
    department: 'Engineering',
  },
  hod: {
    id: 'hod-001',
    name: 'Sarah Smith',
    email: 'sarah.smith@company.com',
    role: 'HOD' as const,
    department: 'Engineering',
  },
  it: {
    id: 'it-001',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'IT_INFRA' as const,
    department: 'IT Operations',
  },
};

// Departments
export const DEPARTMENTS = [
  'Engineering',
  'Finance',
  'Human Resources',
  'Marketing',
  'Sales',
  'Operations',
  'Legal',
];
