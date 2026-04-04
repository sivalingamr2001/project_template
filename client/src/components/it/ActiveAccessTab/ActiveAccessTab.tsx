import { Card, CardContent } from '../../ui/card';
import { ActiveAccessTable } from './ActiveAccessTable';
import { useActiveAccess } from '../useActiveAccess';
import { useRevokeAccess } from '../useRevokeAccess';

export function ActiveAccessTab() {
  const { data = [] } = useActiveAccess();
  const revoke = useRevokeAccess();
  return (
    <Card>
      <CardContent className="pt-4">
        <ActiveAccessTable data={data} onRevoke={(id) => revoke.mutate(id)} />
      </CardContent>
    </Card>
  );
}
