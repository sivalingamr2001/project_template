import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { AccessTableFilters } from '../../hod/EmployeeLookupTab/AccessTableFilters';
import { EmployeeCard } from '../../hod/EmployeeLookupTab/EmployeeCard';
import { EmployeeSearchBar } from '../../hod/EmployeeLookupTab/EmployeeSearchBar';
import { ITEmployeeAccessTable } from './ITEmployeeAccessTable';
import { useEmployeeLookup } from '../../hod/useEmployeeLookup';
import type { ApprovalItem } from '../../hod/hod.types';
import { useRevokeAccess } from '../useRevokeAccess';

export function ITEmployeeLookupTab() {
  const [empId, setEmpId] = useState('');
  const [filter, setFilter] = useState('All');
  const { data } = useEmployeeLookup(empId);
  const revoke = useRevokeAccess();
  const rows = data?.accesses?.filter((item: ApprovalItem) => filter === 'All' || item.accessType === filter) ?? [];

  return (
    <div className="space-y-4">
      <EmployeeSearchBar onSearch={setEmpId} />
      {data ? (
        <>
          <EmployeeCard employee={data} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="text-sm font-medium">Employee Access</div>
              <AccessTableFilters onChange={setFilter} />
            </CardHeader>
            <CardContent>
              <ITEmployeeAccessTable data={rows} onRevoke={(id) => revoke.mutate(id)} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Search for an employee to inspect or revoke access
        </div>
      )}
    </div>
  );
}
