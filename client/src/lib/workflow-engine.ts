import type { AccessRequest, AccessItem, AccessItemStatus, ApprovalRecord } from './types';

/**
 * Workflow Engine - Centralized state machine for request transitions
 * Enforces all business rules and prevents invalid state transitions
 */

export class WorkflowEngine {
  /**
   * Transition an access item from one state to another with validation
   */
  static transitionItemStatus(
    item: AccessItem,
    newStatus: AccessItemStatus,
    approverRole: ApprovalType,
    approverId: number,
    approverName: string,
    comment?: string,
    accessType?: string
  ): { success: boolean; item: AccessItem; error?: string } {
    // Rule: Cannot approve an already expired item
    if (new Date(item.expiresAt) < new Date()) {
      return { success: false, item, error: 'Cannot approve expired access' };
    }

    // Rule: IT cannot approve before HOD
    if (approverRole === 'IT' && item.status !== 'PendingHOD') {
      return { success: false, item, error: 'IT can only approve after HOD approval' };
    }

    // Rule: Cannot transition from rejected or revoked
    if (item.status === 'REJECTED' || item.status === 'REVOKED') {
      return { success: false, item, error: `Cannot transition from ${item.status} status` };
    }

    const record: ApprovalRecord = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      approverRole,
      approverId,
      approverName,
      action: newStatus === 'REJECTED' ? 'REJECTED' : 'APPROVED',
      comment,
      timestamp: new Date().toISOString(),
      previousStatus: item.status as AccessItemStatus,
    };

    if (approverRole === 'HOD' && accessType) {
      item.accessType = accessType
    }

    item.approvalHistory.push(record);
    item.status = newStatus;

    return { success: true, item };
  }

  /**
   * Calculate request status based on all items
   */
  static calculateRequestStatus(request: AccessRequest): AccessStatus {
    const itemStatuses = request.items.map(i => i.status);

    if (itemStatuses.includes('Rejected')) return 'Rejected';
    if (itemStatuses.every(s => s === 'Approved')) return 'Approved';
    if (itemStatuses.every(s => ['Approved', 'Expired'].includes(s))) return 'Approved';
    if (itemStatuses.includes('PendingIT')) return 'PendingIT';
    if (itemStatuses.includes('PendingHOD')) return 'PendingHOD';
    if (itemStatuses.includes('Revoked')) return 'Revoked';
    return 'PendingHOD';
  }

  /**
   * Check if all items have been reviewed by HOD
   */
  static allItemsReviewedByHod(request: AccessRequest): boolean {
    return request.items.every(item =>
      ['PendingIT', 'Approved', 'Rejected', 'Revoked'].includes(item.status)
    );
  }

  /**
   * Check if all items have been reviewed by IT
   */
  static allItemsReviewedByIT(request: AccessRequest): boolean {
    return request.items.every(item =>
      ['Approved', 'Rejected', 'Revoked'].includes(item.status)
    );
  }

  /**
   * Check if request can progress to next stage
   */
  static canProgressToNextStage(request: AccessRequest, currentRole: ApprovalType): boolean {
    if (currentRole === 'HOD') {
      return this.allItemsReviewedByHod(request);
    }
    if (currentRole === 'IT') {
      return this.allItemsReviewedByIT(request) && request.items.every(i => i.status !== 'PendingHOD');
    }
    return false;
  }

  /**
   * Get pending items for a role
   */
  static getPendingItemsForRole(request: AccessRequest, role: ApprovalType): AccessItem[] {
    if (role === 'HOD') {
      return request.items.filter(i => i.status === 'PendingHOD');
    }
    if (role === 'IT') {
      return request.items.filter(i => i.status === 'PendingIT');
    }
    return [];
  }

  /**
   * Activate an access item (make it ACTIVE from approved states)
   */
  static activateItem(item: AccessItem): AccessItem {
    if (item.status === 'PendingIT') {
      item.status = 'Approved';
    }
    return item;
  }

  /**
   * Check and mark items as expired if past expiry date
   */
  static checkAndMarkExpired(item: AccessItem): AccessItem {
    if (item.status === 'Approved' && new Date(item.expiresAt) < new Date()) {
      item.status = 'Expired';
    }
    return item;
  }

  /**
   * Check if item is expiring soon (within 30 days)
   */
  static isExpiringWithin30Days(item: AccessItem): boolean {
    if (item.status !== 'Approved') return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }
}
