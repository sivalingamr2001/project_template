import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../shared/StatusBadge';
import { formatDate } from '../../lib/utils';
import { Plus, Eye } from 'lucide-react';

export function RequestList() {
  const { requests } = useData();
  const { currentUser, setCurrentPage, setSelectedRequestId } = useApp();

  const userRequests = requests.filter(r => r.requesterId === currentUser?.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Requests</h2>
        <button
          onClick={() => setCurrentPage('EMPLOYEE_DASHBOARD')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      {userRequests.length === 0 ? (
        <div className="text-center py-12 bg-secondary/50 rounded border border-border">
          <p className="text-muted-foreground">No requests yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {userRequests.map(request => (
            <div
              key={request.id}
              className="border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-secondary/30 transition cursor-pointer"
              onClick={() => {
                setSelectedRequestId(request.id);
                setCurrentPage('EMPLOYEE_REQUEST_DETAIL');
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">
                      {request.items.map(i => i.system).join(', ')}
                    </h3>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {request.items.length} access item{request.items.length !== 1 ? 's' : ''} • Requested {formatDate(request.requestedAt)}
                  </p>
                  <div className="flex gap-2">
                    {request.items.slice(0, 3).map(item => (
                      <span key={item.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {item.accessType}
                      </span>
                    ))}
                  </div>
                </div>
                <Eye size={20} className="text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
