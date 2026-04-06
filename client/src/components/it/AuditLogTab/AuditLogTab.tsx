import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { AuditTable } from './AuditTable';
import { AuditFilters } from './AuditFilters';
import { useAuditLog } from '../useAuditLog';

export function AuditLogTab() {
  const [filter, setFilter] = useState('All');
  const { data = [], isLoading } = useAuditLog(filter);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="text-sm font-medium">Audit Log</div>
        <AuditFilters onChange={setFilter} />
      </CardHeader>
      <CardContent>
        <AuditTable data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
