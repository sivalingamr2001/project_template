export interface ApprovalItem {
  id: number;
  employeeName: string;
  empId: string;
  folderName: string;
  accessType: string;
  status: string;
}

export interface EmployeeLookupResult {
  empId: string;
  empName: string;
  department: string;
  active: number;
  pending: number;
  expired: number;
  accesses: ApprovalItem[];
}

export const hodKeys = {
  pending: () => ['hod', 'pending'] as const,
  history: () => ['hod', 'history'] as const,
  employeeLookup: (empId: string) => ['hod', 'employee', empId] as const,
};
