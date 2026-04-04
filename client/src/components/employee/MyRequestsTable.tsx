import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { StatusBadge } from '../shared/StatusBadge';
import { formatDate } from '../../lib/utils';
import { Eye, Plus, RefreshCw, Search } from 'lucide-react';
import type { AccessRequest } from '../../lib/types';

export function MyRequestsTable({
  data,
  isLoading,
  onViewDetail,
  onNewRequest,
}: {
  data: AccessRequest[];
  isLoading: boolean;
  onViewDetail: (id: string) => void;
  onNewRequest: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return data.filter((request) => {
      if (!query) return true;

      const systems = request.items.map(i => i.system).join(' ').toLowerCase();
      const accessTypes = request.items.map(i => i.accessType).join(' ').toLowerCase();

      return (
        request.id.toLowerCase().includes(query) ||
        systems.includes(query) ||
        accessTypes.includes(query) ||
        request.status.toLowerCase().includes(query)
      );
    });
  }, [data, searchTerm, refreshTick]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search requests"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setRefreshTick(prev => prev + 1)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={onNewRequest}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Systems</TableHead>
              <TableHead>Access Types</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.items.map(i => i.system).join(', ')}</TableCell>
                  <TableCell>{request.items.map(i => i.accessType).join(', ')}</TableCell>
                  <TableCell>{formatDate(request.requestedAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(request.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
