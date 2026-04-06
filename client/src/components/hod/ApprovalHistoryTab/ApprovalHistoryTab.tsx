import { Card, CardContent } from '../../ui/card';
import { HistoryTable } from './HistoryTable';
import { useApprovalHistory } from '../useApprovalHistory';

export function ApprovalHistoryTab() {
  const { data = [], isLoading } = useApprovalHistory();
  return (
    <Card>
      <CardContent className="pt-4">
        <HistoryTable data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
