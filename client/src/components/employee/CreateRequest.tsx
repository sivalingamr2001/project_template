import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from "@/hooks/useApp"
import { SYSTEMS, ACCESS_TYPES, MAX_ACCESS_DAYS } from '../../lib/constants';
import { generateId, addDays } from '../../lib/utils';
import type { AccessRequest } from '../../lib/types';
import { Plus, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface AccessItemForm {
  id: number;
  system: string;
  accessType: string;
}

export function CreateRequest() {
  const { addRequest } = useData();
  const { currentUser, setCurrentPage, setSelectedRequestId } = useApp();
  const [items, setItems] = useState<AccessItemForm[]>([{ id: generateId(), system: '', accessType: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { id: generateId(), system: '', accessType: '' }]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: number, field: string, value: string) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = () => {
    if (!currentUser) {
      toast.error('User session not available');
      return;
    }

    if (items.some(item => !item.system || !item.accessType)) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const now = new Date().toISOString();
    const request: AccessRequest = {
      id: generateId(),
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterDept: currentUser.department || 'Engineering',
      requestedAt: now,
      items: items.map(item => ({
        id: generateId(),
        system: item.system,
        accessType: item.accessType,
        requestedAt: now,
        expiresAt: addDays(now, MAX_ACCESS_DAYS),
        status: 'PENDING' as const,
        approvalHistory: [],
      })),
      status: 'PENDING' as const,
      approvalTimeline: [],
    };

    addRequest(request);
    toast.success('Request created successfully!');
    setSelectedRequestId(request.id);
    setCurrentPage('EMPLOYEE_REQUEST_DETAIL');
    setSubmitting(false);
  };

  return (
    <>
      <Toaster />
      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Create Access Request</h2>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-secondary/50 rounded border border-border">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">System</label>
                <select
                  value={item.system}
                  onChange={(e) => handleItemChange(item.id, 'system', e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select system...</option>
                  {SYSTEMS.map(sys => (
                    <option key={sys} value={sys}>{sys}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Access Type</label>
                <select
                  value={item.accessType}
                  onChange={(e) => handleItemChange(item.id, 'accessType', e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select type...</option>
                  {ACCESS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="self-end p-2 hover:bg-destructive/10 rounded transition text-destructive"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-primary text-primary rounded hover:bg-primary/5 transition mb-6"
        >
          <Plus size={18} />
          Add Another Item
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Request'}
          </button>
          <button
            onClick={() => setCurrentPage('EMPLOYEE_REQUESTS')}
            className="px-6 py-2 border border-border rounded hover:bg-secondary transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
