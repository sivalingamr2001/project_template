import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { AccessRequest, AccessItemStatus, Notification } from '../lib/types';
import { WorkflowEngine } from '../lib/workflow-engine';
import { useApp } from '@/hooks/useApp';

interface DataContextType {
  requests: AccessRequest[];
  notifications: Notification[];
  addRequest: (request: AccessRequest) => void;
  updateRequest: (request: AccessRequest) => void;
  approveItem: (requestId: string, itemId: string, comment?: string) => boolean;
  rejectItem: (requestId: string, itemId: string, comment?: string) => boolean;
  revokeItem: (requestId: string, itemId: string) => void;
  extendItemExpiry: (requestId: string, itemId: string, days: number) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentRole, currentUser } = useApp();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateNotifications = (reqs: AccessRequest[], role: string, userId: string) => {
    const notifs: Notification[] = [];

    if (role === 'HOD') {
      const pendingCount = reqs.filter(r =>
        r.items.some(i => i.status === 'PENDING')
      ).length;
      if (pendingCount > 0) {
        notifs.push({
          id: `notif-hod-${Date.now()}`,
          userId,
          role: 'HOD' as any,
          type: 'PENDING_APPROVAL',
          requestId: reqs.find(r => r.items.some(i => i.status === 'PENDING'))?.id || '',
          message: `${pendingCount} requests waiting for approval`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else if (role === 'IT_INFRA') {
      const itPendingCount = reqs.filter(r =>
        r.items.some(i => i.status === 'APPROVED_HOD')
      ).length;
      if (itPendingCount > 0) {
        notifs.push({
          id: `notif-it-${Date.now()}`,
          userId,
          role: 'IT_INFRA' as any,
          type: 'PENDING_APPROVAL',
          requestId: reqs.find(r => r.items.some(i => i.status === 'APPROVED_HOD'))?.id || '',
          message: `${itPendingCount} requests waiting for IT approval`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    setNotifications(notifs);
  };

  // Generate notifications from live request state when the user context changes
  useEffect(() => {
    if (currentUser && currentRole) {
      generateNotifications(requests, currentRole, currentUser.id);
    } else {
      setNotifications([]);
    }
  }, [currentUser, currentRole, requests]);

  const addRequest = (request: AccessRequest) => {
    setRequests([...requests, request]);
  };

  const updateRequest = (updatedRequest: AccessRequest) => {
    setRequests(requests.map(r => (r.id === updatedRequest.id ? updatedRequest : r)));
  };

  const approveItem = (requestId: string, itemId: string, comment?: string): boolean => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return false;

    const item = request.items.find(i => i.id === itemId);
    if (!item) return false;

    const newStatus = currentRole === 'HOD' ? 'APPROVED_HOD' : 'APPROVED_IT';
    const result = WorkflowEngine.transitionItemStatus(
      item,
      newStatus as AccessItemStatus,
      currentRole === 'HOD' ? 'HOD' : 'IT_INFRA',
      currentUser.id,
      currentUser.name,
      comment
    );

    if (result.success) {
      const updatedRequest = {
        ...request,
        items: request.items.map(i => (i.id === itemId ? result.item : i)),
        approvalTimeline: [
          ...request.approvalTimeline,
          {
            id: `approval-${Date.now()}`,
            approverRole: (currentRole === 'HOD' ? 'HOD' : 'IT_INFRA') as any,
            approverId: currentUser.id,
            approverName: currentUser.name,
            action: 'APPROVED' as const,
            comment,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      updateRequest(updatedRequest);
      return true;
    }
    return false;
  };

  const rejectItem = (requestId: string, itemId: string, comment?: string): boolean => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return false;

    const item = request.items.find(i => i.id === itemId);
    if (!item) return false;

    const result = WorkflowEngine.transitionItemStatus(
      item,
      'REJECTED',
      currentRole === 'HOD' ? 'HOD' : 'IT_INFRA',
      currentUser.id,
      currentUser.name,
      comment
    );

    if (result.success) {
      const updatedRequest = {
        ...request,
        items: request.items.map(i => (i.id === itemId ? result.item : i)),
        status: 'REJECTED' as any,
        rejectionReason: comment,
        approvalTimeline: [
          ...request.approvalTimeline,
          {
            id: `approval-${Date.now()}`,
            approverRole: (currentRole === 'HOD' ? 'HOD' : 'IT_INFRA') as any,
            approverId: currentUser.id,
            approverName: currentUser.name,
            action: 'REJECTED' as const,
            comment,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      updateRequest(updatedRequest);
      return true;
    }
    return false;
  };

  const revokeItem = (requestId: string, itemId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequest = {
      ...request,
      items: request.items.map(item =>
        item.id === itemId ? { ...item, status: 'REVOKED' as const } : item
      ),
    };
    updateRequest(updatedRequest);
  };

  const extendItemExpiry = (requestId: string, itemId: string, days: number) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequest = {
      ...request,
      items: request.items.map(item => {
        if (item.id === itemId && item.status === 'ACTIVE') {
          const newExpiryDate = new Date(item.expiresAt);
          newExpiryDate.setDate(newExpiryDate.getDate() + days);
          return { ...item, expiresAt: newExpiryDate.toISOString() };
        }
        return item;
      }),
    };
    updateRequest(updatedRequest);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  return (
    <DataContext.Provider
      value={{
        requests,
        notifications,
        addRequest,
        updateRequest,
        approveItem,
        rejectItem,
        revokeItem,
        extendItemExpiry,
        markNotificationAsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
