import type { AccessRequest } from './types';
import { MOCK_USERS, SYSTEMS, ACCESS_TYPES } from './constants';
import { generateId, addDays } from './utils';

/**
 * Generate realistic mock requests with varied statuses
 */
export function generateMockRequests(): AccessRequest[] {
  const now = new Date().toISOString();

  const requests: AccessRequest[] = [
    // Pending requests
    {
      id: generateId(),
      requesterId: 'emp-002',
      requesterName: 'Alice Johnson',
      requesterDept: 'Finance',
      requestedAt: addDays(now, -5),
      status: 'PENDING',
      items: [
        {
          id: generateId(),
          system: 'Salesforce',
          accessType: 'Admin',
          requestedAt: addDays(now, -5),
          expiresAt: addDays(now, 360),
          status: 'PENDING',
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },
    {
      id: generateId(),
      requesterId: 'emp-003',
      requesterName: 'Bob Williams',
      requesterDept: 'Engineering',
      requestedAt: addDays(now, -3),
      status: 'PENDING',
      items: [
        {
          id: generateId(),
          system: 'GitHub Enterprise',
          accessType: 'Developer',
          requestedAt: addDays(now, -3),
          expiresAt: addDays(now, 362),
          status: 'PENDING',
          approvalHistory: [],
        },
        {
          id: generateId(),
          system: 'Jenkins',
          accessType: 'Editor',
          requestedAt: addDays(now, -3),
          expiresAt: addDays(now, 362),
          status: 'PENDING',
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },

    // HOD Approved requests
    {
      id: generateId(),
      requesterId: 'emp-004',
      requesterName: 'Carol Davis',
      requesterDept: 'Marketing',
      requestedAt: addDays(now, -10),
      status: 'HOD_APPROVED',
      items: [
        {
          id: generateId(),
          system: 'AWS Console',
          accessType: 'View Only',
          requestedAt: addDays(now, -10),
          expiresAt: addDays(now, 355),
          status: 'APPROVED_HOD',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'APPROVED',
              comment: 'Access approved. User has necessary experience.',
              timestamp: addDays(now, -8),
              previousStatus: 'PENDING',
            },
          ],
        },
      ],
      approvalTimeline: [
        {
          id: generateId(),
          approverRole: 'HOD',
          approverId: MOCK_USERS.hod.id,
          approverName: MOCK_USERS.hod.name,
          action: 'APPROVED',
          comment: 'Access approved. User has necessary experience.',
          timestamp: addDays(now, -8),
        },
      ],
    },

    // IT Approved (ready to activate)
    {
      id: generateId(),
      requesterId: 'emp-005',
      requesterName: 'David Brown',
      requesterDept: 'Engineering',
      requestedAt: addDays(now, -15),
      status: 'IT_APPROVED',
      items: [
        {
          id: generateId(),
          system: 'DataDog',
          accessType: 'Editor',
          requestedAt: addDays(now, -15),
          expiresAt: addDays(now, 350),
          status: 'APPROVED_IT',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'APPROVED',
              timestamp: addDays(now, -12),
              previousStatus: 'PENDING',
            },
            {
              id: generateId(),
              approverRole: 'IT_INFRA',
              approverId: MOCK_USERS.it.id,
              approverName: MOCK_USERS.it.name,
              action: 'APPROVED',
              comment: 'Infrastructure resources available. Access provisioned.',
              timestamp: addDays(now, -10),
              previousStatus: 'APPROVED_HOD',
            },
          ],
        },
      ],
      approvalTimeline: [
        {
          id: generateId(),
          approverRole: 'HOD',
          approverId: MOCK_USERS.hod.id,
          approverName: MOCK_USERS.hod.name,
          action: 'APPROVED',
          timestamp: addDays(now, -12),
        },
        {
          id: generateId(),
          approverRole: 'IT_INFRA',
          approverId: MOCK_USERS.it.id,
          approverName: MOCK_USERS.it.name,
          action: 'APPROVED',
          comment: 'Infrastructure resources available. Access provisioned.',
          timestamp: addDays(now, -10),
        },
      ],
    },

    // Active requests
    {
      id: generateId(),
      requesterId: 'emp-006',
      requesterName: 'Eve Wilson',
      requesterDept: 'Operations',
      requestedAt: addDays(now, -30),
      status: 'ACTIVE',
      items: [
        {
          id: generateId(),
          system: 'ServiceNow',
          accessType: 'Editor',
          requestedAt: addDays(now, -30),
          expiresAt: addDays(now, 335),
          status: 'ACTIVE',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'APPROVED',
              timestamp: addDays(now, -28),
              previousStatus: 'PENDING',
            },
            {
              id: generateId(),
              approverRole: 'IT_INFRA',
              approverId: MOCK_USERS.it.id,
              approverName: MOCK_USERS.it.name,
              action: 'APPROVED',
              timestamp: addDays(now, -26),
              previousStatus: 'APPROVED_HOD',
            },
          ],
        },
      ],
      approvalTimeline: [
        {
          id: generateId(),
          approverRole: 'HOD',
          approverId: MOCK_USERS.hod.id,
          approverName: MOCK_USERS.hod.name,
          action: 'APPROVED',
          timestamp: addDays(now, -28),
        },
        {
          id: generateId(),
          approverRole: 'IT_INFRA',
          approverId: MOCK_USERS.it.id,
          approverName: MOCK_USERS.it.name,
          action: 'APPROVED',
          timestamp: addDays(now, -26),
        },
      ],
    },

    // Expiring soon (within 30 days)
    {
      id: generateId(),
      requesterId: 'emp-007',
      requesterName: 'Frank Miller',
      requesterDept: 'Finance',
      requestedAt: addDays(now, -340),
      status: 'ACTIVE',
      items: [
        {
          id: generateId(),
          system: 'Jira',
          accessType: 'Editor',
          requestedAt: addDays(now, -340),
          expiresAt: addDays(now, 15), // Expires in 15 days
          status: 'ACTIVE',
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },

    // Rejected requests
    {
      id: generateId(),
      requesterId: 'emp-008',
      requesterName: 'Grace Lee',
      requesterDept: 'HR',
      requestedAt: addDays(now, -7),
      status: 'REJECTED',
      rejectionReason: 'User role does not require access to this system',
      items: [
        {
          id: generateId(),
          system: 'AWS Console',
          accessType: 'Admin',
          requestedAt: addDays(now, -7),
          expiresAt: addDays(now, 358),
          status: 'REJECTED',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'REJECTED',
              comment: 'User role does not require access to this system',
              timestamp: addDays(now, -6),
              previousStatus: 'PENDING',
            },
          ],
        },
      ],
      approvalTimeline: [
        {
          id: generateId(),
          approverRole: 'HOD',
          approverId: MOCK_USERS.hod.id,
          approverName: MOCK_USERS.hod.name,
          action: 'REJECTED',
          comment: 'User role does not require access to this system',
          timestamp: addDays(now, -6),
        },
      ],
    },

    // Revoked request
    {
      id: generateId(),
      requesterId: 'emp-009',
      requesterName: 'Henry Chen',
      requesterDept: 'Sales',
      requestedAt: addDays(now, -100),
      status: 'REVOKED',
      items: [
        {
          id: generateId(),
          system: 'Slack',
          accessType: 'Admin',
          requestedAt: addDays(now, -100),
          expiresAt: addDays(now, 265),
          status: 'REVOKED',
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },

    // Additional active requests for demo
    ...Array.from({ length: 15 }, (_, i): AccessRequest => ({
      id: generateId(),
      requesterId: `emp-${100 + i}`,
      requesterName: `Employee ${100 + i}`,
      requesterDept: ['Engineering', 'Finance', 'Marketing', 'Sales', 'Operations'][i % 5],
      requestedAt: addDays(now, -(20 + i * 3)),
      status: i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'HOD_APPROVED' : 'ACTIVE',
      items: [
        {
          id: generateId(),
          system: SYSTEMS[i % SYSTEMS.length],
          accessType: ACCESS_TYPES[i % ACCESS_TYPES.length],
          requestedAt: addDays(now, -(20 + i * 3)),
          expiresAt: addDays(now, 345 - i * 2),
          status: i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'APPROVED_HOD' : 'ACTIVE',
          approvalHistory: i % 3 === 0 ? [] : [
            {
              id: generateId(),
              approverRole: 'HOD' as const,
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'APPROVED' as const,
              timestamp: addDays(now, -(18 + i * 3)),
            },
          ],
        },
      ],
      approvalTimeline: i % 3 === 0 ? [] : [
        {
          id: generateId(),
          approverRole: 'HOD' as const,
          approverId: MOCK_USERS.hod.id,
          approverName: MOCK_USERS.hod.name,
          action: 'APPROVED' as const,
          timestamp: addDays(now, -(18 + i * 3)),
        },
      ],
    })),
  ];

  return requests;
}

/**
 * Get mock current user based on role
 */
export function getMockUserByRole(role: 'EMPLOYEE' | 'HOD' | 'IT_INFRA') {
  if (role === 'HOD') return MOCK_USERS.hod;
  if (role === 'IT_INFRA') return MOCK_USERS.it;
  return MOCK_USERS.employee;
}
