import type { AccessRequest, AccessItem } from './types';
import { WorkflowEngine } from './workflow-engine';

/**
 * Status Utils - Derive status from data to prevent inconsistency
 * Never store computed status, always calculate from source data
 */

/**
 * Get derived request status (never stored, always computed)
 */
export function getRequestStatus(request: AccessRequest): string {
  return WorkflowEngine.calculateRequestStatus(request);
}

/**
 * Get derived item status (accounting for expiry)
 */
export function getAccessItemStatus(item: AccessItem): string {
  const checkedItem = WorkflowEngine.checkAndMarkExpired({ ...item });
  return checkedItem.status;
}

/**
 * Check if request is expiring soon
 */
export function isRequestExpiringWithin30Days(request: AccessRequest): boolean {
  return request.items.some(item => WorkflowEngine.isExpiringWithin30Days(item));
}

/**
 * Check if request has any expiring items
 */
export function getExpiringItems(request: AccessRequest): AccessItem[] {
  return request.items.filter(item => WorkflowEngine.isExpiringWithin30Days(item));
}

/**
 * Get days until expiry for an item
 */
export function getDaysUntilExpiry(item: AccessItem): number {
  const daysUntilExpiry = Math.ceil(
    (new Date(item.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, daysUntilExpiry);
}

/**
 * Check if an item is active
 */
export function isItemActive(item: AccessItem): boolean {
  return getAccessItemStatus(item) === 'ACTIVE';
}

/**
 * Check if an item is expired
 */
export function isItemExpired(item: AccessItem): boolean {
  return getAccessItemStatus(item) === 'EXPIRED';
}

/**
 * Check if request can be edited (only if pending)
 */
export function canEditRequest(request: AccessRequest): boolean {
  return getRequestStatus(request) === 'PENDING';
}

/**
 * Get approval progress percentage
 */
export function getApprovalProgress(request: AccessRequest): number {
  const total = request.items.length;
  const approved = request.items.filter(i => 
    i.status === 'ACTIVE' || i.status === 'APPROVED_IT'
  ).length;
  return Math.round((approved / total) * 100);
}

/**
 * Check if HOD approval is needed
 */
export function needsHodApproval(request: AccessRequest): boolean {
  return request.items.some(i => i.status === 'PENDING');
}

/**
 * Check if IT approval is needed
 */
export function needsITApproval(request: AccessRequest): boolean {
  return request.items.some(i => i.status === 'APPROVED_HOD');
}

/**
 * Get summary text for request status
 */
export function getStatusSummary(request: AccessRequest): string {
  const total = request.items.length;
  const pending = request.items.filter(i => i.status === 'PENDING').length;
  const hodApproved = request.items.filter(i => i.status === 'APPROVED_HOD').length;
  const itApproved = request.items.filter(i => i.status === 'APPROVED_IT').length;

  if (pending > 0) return `Pending HOD approval: ${pending}/${total} items`;
  if (hodApproved > 0) return `Pending IT approval: ${hodApproved}/${total} items`;
  if (itApproved > 0) return `Activating access: ${itApproved}/${total} items`;
  return `All items approved`;
}
