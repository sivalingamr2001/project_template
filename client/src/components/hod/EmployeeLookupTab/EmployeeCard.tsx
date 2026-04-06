import { Card, CardContent } from '../../ui/card';
import { StatRow } from './StatRow';
import type { EmployeeLookupResult } from '../hod.types';

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2);

export function EmployeeCard({ employee }: { employee: EmployeeLookupResult }) {
  return (
    <Card>
      <CardContent className="space-y-5 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {initials(employee.empName)}
          </div>
          <div>
            <div className="font-semibold">{employee.empName}</div>
            <div className="text-sm text-muted-foreground">{employee.department}</div>
            <div className="text-xs text-muted-foreground">{employee.empId}</div>
            {employee.employeeCode && (
              <div className="text-xs text-muted-foreground">Code: {employee.employeeCode}</div>
            )}
            {employee.email && (
              <div className="text-xs text-muted-foreground">{employee.email}</div>
            )}
            {employee.hodName && (
              <div className="text-xs text-muted-foreground">
                HOD: {employee.hodName}
                {employee.hodEmail ? ` • ${employee.hodEmail}` : ""}
              </div>
            )}
          </div>
        </div>
        <StatRow active={employee.active} pending={employee.pending} expired={employee.expired} />
      </CardContent>
    </Card>
  );
}
