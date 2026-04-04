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
      requesterId: 2002,
      requesterName: 'Alice Johnson',
      requesterDept: 'Finance',
      requestedAt: addDays(now, -5),
      status: 'PendingHOD',
      items: [
        {
          id: generateId(),
          system: 'Salesforce',
          accessType: 'ReadAndWrite',
          requestedAt: addDays(now, -5),
          expiresAt: addDays(now, 360),
          status: 'PendingHOD',
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },
    {
      id: generateId(),
      requesterId: 2003,
      requesterName: 'Bob Williams',
      requesterDept: 'Engineering',
      requestedAt: addDays(now, -3),
      status: 'PendingHOD',
      items: [
        {
          id: generateId(),
          system: 'GitHub Enterprise',
          accessType: 'ReadAndWrite',
          requestedAt: addDays(now, -3),
          expiresAt: addDays(now, 362),
          status: 'PendingHOD',
          approvalHistory: [],
        },
        {
          id: generateId(),
          system: 'Jenkins',
          accessType: 'ReadAndWrite',
          requestedAt: addDays(now, -3),
          expiresAt: addDays(now, 362),
          status: 'PendingHOD',
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },

    // HOD Approved requests
    {
      id: generateId(),
      requesterId: 2004,
      requesterName: 'Carol Davis',
      requesterDept: 'Marketing',
      requestedAt: addDays(now, -10),
      status: 'PendingIT',
      items: [
        {
          id: generateId(),
          system: 'AWS Console',
          accessType: 'ReadOnly',
          requestedAt: addDays(now, -10),
          expiresAt: addDays(now, 355),
          status: 'PendingIT',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'HODApproved',
              comment: 'Access approved. User has necessary experience.',
              timestamp: addDays(now, -8),
              previousStatus: 'PendingHOD',
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
          action: 'ITApproved',
          comment: 'Access approved. User has necessary experience.',
          timestamp: addDays(now, -8),
        },
      ],
    },

    // IT Approved (ready to activate)
    {
      id: generateId(),
      requesterId: 2005,
      requesterName: 'David Brown',
      requesterDept: 'Engineering',
      requestedAt: addDays(now, -15),
      status: 'Approved',
      items: [
        {
          id: generateId(),
          system: 'DataDog',
          accessType: 'ReadAndWrite',
          requestedAt: addDays(now, -15),
          expiresAt: addDays(now, 350),
          status: 'Approved',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'HODApproved',
              timestamp: addDays(now, -12),
              previousStatus: 'PendingHOD',
            },
            {
              id: generateId(),
              approverRole: 'IT',
              approverId: MOCK_USERS.it.id,
              approverName: MOCK_USERS.it.name,
              action: 'ITApproved',
              comment: 'Infrastructure resources available. Access provisioned.',
              timestamp: addDays(now, -10),
              previousStatus: 'PendingIT',
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
          action: 'HODApproved',
          timestamp: addDays(now, -12),
        },
        {
          id: generateId(),
          approverRole: 'IT',
          approverId: MOCK_USERS.it.id,
          approverName: MOCK_USERS.it.name,
          action: 'ITApproved',
          comment: 'Infrastructure resources available. Access provisioned.',
          timestamp: addDays(now, -10),
        },
      ],
    },

    // Active requests
    {
      id: generateId(),
      requesterId: 2006,
      requesterName: 'Eve Wilson',
      requesterDept: 'Operations',
      requestedAt: addDays(now, -30),
      status: 'Approved',
      items: [
        {
          id: generateId(),
          system: 'ServiceNow',
          accessType: 'ReadAndWrite',
          requestedAt: addDays(now, -30),
          expiresAt: addDays(now, 335),
          status: 'Approved',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'ITApproved',
              timestamp: addDays(now, -28),
              previousStatus: 'PendingIT',
            },
            {
              id: generateId(),
              approverRole: 'IT',
              approverId: MOCK_USERS.it.id,
              approverName: MOCK_USERS.it.name,
              action: 'ITApproved',
              timestamp: addDays(now, -26),
              previousStatus: 'PendingIT',
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
          action: 'HODApproved',
          timestamp: addDays(now, -28),
        },
        {
          id: generateId(),
          approverRole: 'IT',
          approverId: MOCK_USERS.it.id,
          approverName: MOCK_USERS.it.name,
          action: 'ITApproved',
          timestamp: addDays(now, -26),
        },
      ],
    },

    // Expiring soon (within 30 days)
    {
      id: generateId(),
      requesterId: 2007,
      requesterName: 'Frank Miller',
      requesterDept: 'Finance',
      requestedAt: addDays(now, -340),
      status: 'Approved',
      items: [
        {
          id: generateId(),
          system: 'Jira',
          accessType: 'ReadAndWrite',
          requestedAt: addDays(now, -340),
          expiresAt: addDays(now, 15), // Expires in 15 days
          status: 'Approved',
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },

    // Rejected requests
    {
      id: generateId(),
      requesterId: 2008,
      requesterName: 'Grace Lee',
      requesterDept: 'HR',
      requestedAt: addDays(now, -7),
      status: 'Approved',
      rejectionReason: 'User role does not require access to this system',
      items: [
        {
          id: generateId(),
          system: 'AWS Console',
          accessType: 'ReadOnly',
          requestedAt: addDays(now, -7),
          expiresAt: addDays(now, 358),
          status: 'Approved',
          approvalHistory: [
            {
              id: generateId(),
              approverRole: 'HOD',
              approverId: MOCK_USERS.hod.id,
              approverName: MOCK_USERS.hod.name,
              action: 'ITApproved',
              comment: 'User role does not require access to this system',
              timestamp: addDays(now, -6),
              previousStatus: 'PendingIT',
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
          action: 'ITRejected',
          comment: 'User role does not require access to this system',
          timestamp: addDays(now, -6),
        },
      ],
    },

    // Revoked request
    {
      id: generateId(),
      requesterId: 2009,
      requesterName: 'Henry Chen',
      requesterDept: 'Sales',
      requestedAt: addDays(now, -100),
      status: 'Revoked',
      items: [
        {
          id: generateId(),
          system: 'Slack',
          accessType: 'ReadAndWrite',
          requestedAt: addDays(now, -100),
          expiresAt: addDays(now, 265),
          status: 'Revoked' as const,
          approvalHistory: [],
        },
      ],
      approvalTimeline: [],
    },

    // Additional active requests for demo
    ...Array.from({ length: 15 }, (_, i): AccessRequest => ({
      id: generateId(),
      requesterId: 3000 + i,
      requesterName: `Employee ${100 + i}`,
      requesterDept: ['Engineering', 'Finance', 'Marketing', 'Sales', 'Operations'][i % 5],
      requestedAt: addDays(now, -(20 + i * 3)),
      status: i % 3 === 0 ? 'PendingHOD' : i % 3 === 1 ? 'Approved' : 'Approved',
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
export function getMockUserByRole(role: 'User' | 'HOD' | 'IT') {
  if (role === 'HOD') return MOCK_USERS.hod;
  if (role === 'IT') return MOCK_USERS.it;
  return MOCK_USERS.employee;
}
