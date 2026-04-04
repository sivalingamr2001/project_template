import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { AccessRequest, AccessItemStatus, Notification } from '../lib/types';
import { WorkflowEngine } from '../lib/workflow-engine';
import { processExpirations } from '../lib/expiry-job';
import { useApp } from '@/hooks/useApp';

interface DataContextType {
  requests: AccessRequest[];
  notifications: Notification[];
  addRequest: (request: AccessRequest) => void;
  updateRequest: (request: AccessRequest) => void;
  approveItem: (requestId: number, itemId: number, comment?: string, accessType?: string) => boolean;
  rejectItem: (requestId: number, itemId: number, comment?: string) => boolean;
  revokeItem: (requestId: number, itemId: number) => void;
  extendItemExpiry: (requestId: number, itemId: number, days: number) => void;
  markNotificationAsRead: (notificationId: number) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentRole, currentUser } = useApp();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateNotifications = (reqs: AccessRequest[], role: string, userId: number) => {
    const notifs: Notification[] = [];

    if (role === 'HOD') {
      const pendingCount = reqs.filter(r =>
        r.items.some(i => i.status === 'PENDING')
      ).length;
      if (pendingCount > 0) {
        notifs.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          userId,
          role: 'HOD' as any,
          type: 'PENDING_APPROVAL',
          requestid: reqs.find(r => r.items.some(i => i.status === 'PENDING'))?.id || 0,
          message: `${pendingCount} requests waiting for approval`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else if (role === 'IT') {
      const itPendingCount = reqs.filter(r =>
        r.items.some(i => i.status === 'PendingIT')
      ).length;
      if (itPendingCount > 0) {
        notifs.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          userId,
          role: 'IT' as any,
          type: 'PENDING_APPROVAL',
          requestid: reqs.find(r => r.items.some(i => i.status === 'PendingIT'))?.id || 0,
          message: `${itPendingCount} requests waiting for IT approval`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    setNotifications(notifs);
  };

  // Initialize request state empty; HOD/IT views only show user-submitted requests.
  useEffect(() => {
    setRequests([]);
  }, []);

  // Generate notifications from actual request state when user or requests change
  useEffect(() => {
    if (currentUser && currentRole) {
      generateNotifications(requests, currentRole, currentUser.id);
    }
  }, [currentUser, currentRole, requests]);

  const addRequest = (request: AccessRequest) => {
    setRequests([...requests, request]);
  };

  const updateRequest = (updatedRequest: AccessRequest) => {
    setRequests(requests.map(r => (r.id === updatedRequest.id ? updatedRequest : r)));
  };

  const approveItem = (requestId: number, itemId: number, comment?: string, accessType?: string): boolean => {
    if (!currentUser || !currentRole) return false;

    const request = requests.find(r => r.id === requestId);
    if (!request) return false;

    const item = request.items.find(i => i.id === itemId);
    if (!item) return false;

    const newStatus = currentRole === 'HOD' ? 'PendingIT' : 'Approved';
    const result = WorkflowEngine.transitionItemStatus(
      item,
      newStatus as AccessItemStatus,
      currentRole === 'HOD' ? 'HOD' : 'IT',
      currentUser.id,
      currentUser.name,
      comment,
      accessType
    );

    if (result.success) {
      const updatedRequest = {
        ...request,
        items: request.items.map(i => (i.id === itemId ? result.item : i)),
        status: WorkflowEngine.calculateRequestStatus({
          ...request,
          items: request.items.map(i => (i.id === itemId ? result.item : i)),
        }) as any,
        approvalTimeline: [
          ...request.approvalTimeline,
          {
            id: Date.now() + Math.floor(Math.random() * 10000),
            approverRole: (currentRole === 'HOD' ? 'HOD' : 'IT') as any,
            approverId: currentUser.id,
            approverName: currentUser.name,
            action: 'HODApproved' as const,
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

  const rejectItem = (requestId: number, itemId: number, comment?: string): boolean => {
    if (!currentUser || !currentRole) return false;

    const request = requests.find(r => r.id === requestId);
    if (!request) return false;

    const item = request.items.find(i => i.id === itemId);
    if (!item) return false;

    const result = WorkflowEngine.transitionItemStatus(
      item,
      'Rejected',
      currentRole === 'HOD' ? 'HOD' : 'IT',
      currentUser.id,
      currentUser.name,
      comment
    );

    if (result.success) {
      const updatedRequest = {
        ...request,
        items: request.items.map(i => (i.id === itemId ? result.item : i)),
        status: WorkflowEngine.calculateRequestStatus({
          ...request,
          items: request.items.map(i => (i.id === itemId ? result.item : i)),
        }) as any,
        rejectionReason: comment,
        approvalTimeline: [
          ...request.approvalTimeline,
          {
            id: Date.now() + Math.floor(Math.random() * 10000),
            approverRole: (currentRole === 'HOD' ? 'HOD' : 'IT') as any,
            approverId: currentUser.id,
            approverName: currentUser.name,
            action: 'HODRejected' as const,
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

  const revokeItem = (requestId: number, itemId: number) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const updatedItems = request.items.map(item =>
      item.id === itemId ? { ...item, status: 'REVOKED' as const } : item
    );
    const updatedRequest = {
      ...request,
      items: updatedItems,
      status: WorkflowEngine.calculateRequestStatus({
        ...request,
        items: updatedItems,
      }) as any,
    };
    updateRequest(updatedRequest);
  };

  const extendItemExpiry = (requestId: number, itemId: number, days: number) => {
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

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(
      notifications.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const refreshData = () => {
    const processedRequests = processExpirations(requests);
    setRequests(processedRequests);
    if (currentUser && currentRole) {
      generateNotifications(processedRequests, currentRole, currentUser.id);
    }
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
        refreshData,
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
