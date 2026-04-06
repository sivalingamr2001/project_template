import { useData } from '../../context/DataContext';
import { useApp } from "@/hooks/useApp"
import { StatusBadge } from '../shared/StatusBadge';
import { formatDate } from '../../lib/utils';
import { Plus, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function RequestList() {
  const { requests } = useData();
  const { currentUser, setCurrentPage, setSelectedRequestId, setSelectedAccessItemId } = useApp();

  const userRequests = requests.filter(r => r.requesterId === currentUser?.id);

  const getRequestIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "PendingHOD":
      case "PendingIT":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 border-green-200";
      case "Rejected":
        return "bg-red-50 border-red-200";
      case "PendingHOD":
      case "PendingIT":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-secondary/50";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Access Requests</h2>
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
              className={`border rounded-lg p-4 hover:border-primary/50 hover:bg-secondary/30 transition cursor-pointer ${getStatusColor(request.status)}`}
              onClick={() => {
                setSelectedRequestId(request.id);
                setSelectedAccessItemId(undefined);
                setCurrentPage('EMPLOYEE_REQUEST_DETAIL');
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getRequestIcon(request.status)}
                      <h3 className="font-semibold">
                        {request.ticketNumber || `Request #${request.id}`}
                      </h3>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {request.items.length} access item{request.items.length !== 1 ? 's' : ''} • Requested {formatDate(request.requestedAt)}
                  </p>
                  
                  {/* Show item statuses */}
                  <div className="space-y-1 mb-3">
                    {request.items.slice(0, 5).map(item => (
                      <div key={item.id} className="text-xs flex items-center justify-between">
                        <span className="text-muted-foreground">{item.system}</span>
                        <span className={`px-2 py-1 rounded text-white ${
                          item.status === 'Approved' ? 'bg-green-600' :
                          item.status === 'Rejected' ? 'bg-red-600' :
                          item.status === 'PendingHOD' ? 'bg-yellow-600' :
                          item.status === 'PendingIT' ? 'bg-blue-600' :
                          'bg-gray-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                    {request.items.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{request.items.length - 5} more items
                      </p>
                    )}
                  </div>

                  {/* Show access types */}
                  <div className="flex gap-2 flex-wrap">
                    {request.items.slice(0, 3).map(item => (
                      <span key={item.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {item.accessType}
                      </span>
                    ))}
                  </div>
                </div>
                <Eye size={20} className="text-muted-foreground shrink-0 ml-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
