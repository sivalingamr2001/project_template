Overview
Build a production-grade, role-based access request management UI portal with three distinct user roles (Employee, HOD, IT Infra), complete with mock data and full workflow functionality. Each component will be kept under 100 lines of code for maintainability. Built with pure React + TypeScript (Vite) - no Next.js framework.
Project Structure
/src
  /index.tsx                             # React DOM mount point
  /App.tsx                               # Main app component with routing context
  /pages
    /EmployeeDashboard.tsx               # Employee dashboard page
    /EmployeeRequests.tsx                # Employee request list
    /EmployeeRequestDetail.tsx           # Employee request details
    /HODApprovals.tsx                    # HOD approval queue page
    /ITQueue.tsx                         # IT approval queue page
    /ITActiveAccess.tsx                  # IT active access management page
    /Analytics.tsx                       # Executive analytics dashboard
    /RoleSelector.tsx                    # Role selection landing page
  /components
    /layout
      /Sidebar.tsx                       # Navigation sidebar
      /Header.tsx                        # Header with notifications
      /Layout.tsx                        # Main layout wrapper
    /employee
      /CreateRequest.tsx                 # Create access request form
      /RequestList.tsx                   # List of requests
      /RequestDetails.tsx                # Request details view
      /DynamicTableEditor.tsx            # Dynamic access items table
    /hod
      /ApprovalQueue.tsx                 # HOD approval items
      /ApprovalCard.tsx                  # Individual approval item card
    /it
      /ITQueue.tsx                       # IT approval queue
      /ActiveAccessTable.tsx             # Active access management
    /dashboard
      /StatsCards.tsx                    # Analytics cards
      /TrendChart.tsx                    # Simple trend chart
    /shared
      /StatusBadge.tsx                   # Status indicator
      /AuditLog.tsx                      # Audit log viewer
      /ApprovalTimeline.tsx              # Timeline visualization
      /CommentModal.tsx                  # Comment dialog
      /NotificationBell.tsx              # Notification center
      /RoleGuard.tsx                     # Permission guard
  /context
    /AppContext.tsx                      # Global app state (current role, user)
    /DataContext.tsx                     # Global data state (requests, access items)
  /hooks
    /useWorkflow.ts                      # Workflow state management hook
    /useNotifications.ts                 # Notification management hook
    /useFilters.ts                       # Filter and search hook
  /lib
    /constants.ts                        # App constants & status definitions
    /types.ts                            # TypeScript interfaces
    /workflow-engine.ts                  # State machine for transitions & rules
    /status-utils.ts                     # Derived status calculations
    /expiry-job.ts                       # Auto-expiry logic executor
    /mock-data.ts                        # Mock data generator
    /utils.ts                            # Helper utilities

/public
  /index.html                            # HTML entry point

/index.html                              # Root HTML file
/package.json                            # Dependencies (React, Vite, etc.)
/vite.config.ts                          # Vite configuration
/tsconfig.json                           # TypeScript config
/tailwind.config.js                      # Tailwind CSS config

Core Architecture Layers
1. Workflow Engine (/lib/workflow-engine.ts)
Centralized state machine that enforces all business rules:

Handles transitions: Pending → HOD_Approved → IT_Approved → Active
Prevents invalid transitions (IT cannot approve before HOD, rejected stops flow)
Generates approval timeline automatically
Keeps all approval logic out of UI components
Validates expiry dates and auto-revocation

2. Status Utils (/lib/status-utils.ts)
Derived status calculations prevent inconsistency:

getRequestStatus() - Computes overall request state from item states
getAccessItemStatus() - Determines individual item status
isExpiringSoon() - Checks if expiry < 30 days
shouldAutoRevoke() - Determines if item should be revoked
Single source of truth for all status logic

3. Auto Expiry Engine (/lib/expiry-job.ts)
Handles the 365-day expiration lifecycle:

Checks timestamps against current date
Marks expired access items automatically
Triggers revocation notices
Called on portal load and via interval
Mock implementation with real logic structure

State Management Architecture
1. AppContext (/context/AppContext.tsx)

Global user role state (Employee, HOD, IT)
Current logged-in user info
Theme preferences
Provides context to entire app tree

2. DataContext (/context/DataContext.tsx)

Global access requests state
All approval timelines
Active access records
Notification state
Dispatch actions for state updates (add request, approve, reject, etc.)
Integrates with workflow engine for transitions

3. Custom Hooks

useWorkflow() - Handles workflow transitions with business rule enforcement
useNotifications() - Manages notification counts and recent items per role
useFilters() - Search, sort, and filter logic for tables

Component Details & Approach
1. Core Shared Components
StatusBadge.tsx

Maps status to color and icon
Reusable across all roles
Status types: pending, approved, rejected, expired, revoked

audit-log.tsx (Enterprise)

Shows detailed history: Who, When, What Changed, Previous Values
Tracks all state transitions with timestamps
Shows approval/rejection comments with approver info
Used in request details and analytics for compliance/audits
~80 LOC with full audit trail

approval-timeline.tsx

Shows request flow through approvers
Minimal horizontal timeline
Shows timestamps and comments
Integrates with audit log data

notification-bell.tsx (New)

Shows pending notification counts by role
HOD: "3 pending approvals waiting"
IT: "5 items ready for approval"
Employee: "Request approved / expires in 10 days"
Badge with count, dropdown for recent notifications
Makes UI feel like a real system

role-guard.tsx (Permission Layer)

Wraps components to enforce role-based access
Example: <RoleGuard allowed={['HOD']}><ApprovalQueue /></RoleGuard>
Prevents unauthorized users from seeing restricted content
Shows "Access Denied" fallback UI

comment-modal.tsx

Dialog for adding approval/rejection comments
Used by HOD and IT Infra
Auto-populates with user info and timestamp
Integrates with workflow engine

2. Employee Portal (3 main pages)
create-request.tsx

Form with employee info (read-only)
ITSR Number input
Policy agreement checkbox
Embedded dynamic-table-editor.tsx for access items
Submit/Save as Draft buttons

dynamic-table-editor.tsx (~80 lines)

Reusable table for adding/removing rows
Columns: Folder Path, Access Type, Reason
Dropdown for Access Type (Read, Write, Admin, Execute)
Add Row / Delete Row buttons
Validation: no duplicates, all fields required

request-list.tsx (~70 lines)

Table: Request ID, Date, Status, Items Count, Actions
Search by request ID
Filter by status
Actions: View Details, Renew (if expired), Cancel (if pending)

request-details.tsx (~90 lines)

Request info card (employee, date, ITSR)
Access items table (read-only)
Approval timeline showing all approvals
Status badge and action buttons

3. HOD Portal (1 main page)
approval-queue.tsx (~70 lines)

Table showing all pending items (not full requests)
Columns: Employee, Folder Path, Access Type, Reason, Status, Actions
Actions: Approve, Reject (opens comment modal)
Inline status updates
Search and filter by employee

approval-card.tsx (~60 lines)

Card view alternative for approval items
Shows request context
Quick approve/reject buttons
Comment box

4. IT Infra Portal (2 pages)
it-queue.tsx (~75 lines)

Table showing HOD-approved items only
Columns: Employee, Folder, Access, HOD Status, Actions
Actions: Approve, Reject with comments
Approval triggers 365-day expiry
Search and pagination

active-access-table.tsx (~85 lines)

Table of currently active access
Columns: Employee, Folder, Access, Expiry Date, Status Badge, Actions
Actions: Revoke, Extend/Renew (adds 365 days)
Color-code expiring soon (< 30 days)
Shows active, expired, and revoked records

5. Dashboard & Analytics Components
role-selector.tsx (~50 lines)

Three large buttons: Employee, HOD, IT Infra
Sets global role context
Shows selected role prominently

sidebar-nav.tsx (~60 lines)

Role-specific navigation
Links to main pages based on role
Collapse/expand on mobile
Notification badge on nav items

header.tsx (~60 lines)

User name, role, timestamp
Integrated notification-bell.tsx for pending counts
Logout/role switch button
Theme toggle

stats-cards.tsx (Analytics - New)

4 stat cards showing:

Pending Requests (HOD/IT count)
Approved Today (count and trend)
Expiring Soon (< 30 days)
Revoked Access (count)


Color-coded by urgency (red for expiring, green for approved)
Click to filter main view
~80 LOC, highly configurable

/analytics/page.tsx (Executive Dashboard)

Role-restricted to managers/admins
Shows stats-cards prominently
Timeline of recent approvals/rejections
Trend chart (simple bar chart with Recharts)
Audit log viewer filtered by date range
Export capability (mock)

6. Data & Types
mock-data.ts

Generate 20-30 requests with various statuses
Include approved, pending, rejected, expired items
Multiple access items per request
Realistic timeline with comments

types.ts
interface AccessItem {
  id: string
  folderPath: string
  accessType: 'Read' | 'Write' | 'Admin' | 'Execute'
  reason: string
}

interface AccessRequest {
  id: string
  employeeId: string
  employeeName: string
  itsr: string
  items: AccessItem[]
  status: RequestStatus
  createdAt: Date
  approvalTimeline: ApprovalEvent[]
}

interface ApprovalEvent {
  stage: 'Employee' | 'HOD' | 'IT'
  status: 'pending' | 'approved' | 'rejected'
  approvedBy: string
  comment?: string
  timestamp: Date
}
Key Features Implemented
✅ Enterprise Audit Log - Deep visibility: who, when, what changed, previous values
✅ Workflow Engine - Centralized state machine enforcing all business rules
✅ Derived Status Utils - Single source of truth, prevents inconsistency bugs
✅ Auto Expiry Engine - 365-day auto-revocation with notification triggers
✅ Role-based Access Control - RoleGuard component for permission enforcement
✅ Notification System - Bell with pending counts per role
✅ Dashboard Analytics - Executive view with stats, trends, and audit logs
✅ Dynamic form with validation - Add/remove access items
✅ Multi-stage approval workflow - Pending → HOD → IT → Active transitions
✅ Status tracking - Color-coded badges and timeline
✅ Access expiry management - 365-day auto-expiry, manual extensions
✅ Search & filter - Find requests and access items quickly
✅ Mock data - 25-30 realistic requests with varied statuses
✅ Responsive UI - Works on desktop, tablet, mobile
✅ Modular components - All <100 lines, highly reusable
Tech Stack

React 19 (via Vite)
TypeScript (type safety across all layers)
Tailwind CSS (styling and responsive design)
shadcn/ui (pre-built accessible components)
React Context API + Hooks (state management - no Redux needed)
React Hook Form (form validation and management)
Sonner (toast notifications)
Recharts (lightweight charts for analytics)
Vite (fast build tool and dev server)
Lucide React (icons)

Implementation Order

Setup Vite + React project with Tailwind and TypeScript
Create types.ts and constants.ts - Define all interfaces and enums
Create workflow-engine.ts, status-utils.ts, expiry-job.ts - Business logic layer
Create mock-data.ts with realistic data using workflow engine
Create React contexts: AppContext.tsx, DataContext.tsx
Create custom hooks: useWorkflow.ts, useNotifications.ts, useFilters.ts
Build core shared components (StatusBadge, AuditLog, ApprovalTimeline, RoleGuard, NotificationBell, CommentModal)
Build layout components (Layout, Sidebar, Header)
Build employee components (CreateRequest, DynamicTableEditor, RequestList, RequestDetails)
Build HOD components (ApprovalQueue, ApprovalCard)
Build IT components (ITQueue, ActiveAccessTable)
Build dashboard components (StatsCards, TrendChart)
Build pages (EmployeeDashboard, HODApprovals, ITQueue, ITActiveAccess, Analytics, RoleSelector)
Create App.tsx with routing logic using React Router or context-based navigation
Integration testing with mock data

File Count Summary

Pages: 7
Components: 22 (layout, employee, HOD, IT, dashboard, shared)
Contexts: 2 (AppContext, DataContext)
Custom Hooks: 3 (useWorkflow, useNotifications, useFilters)
Lib/Utilities: 7 (types, constants, workflow engine, status utils, expiry job, mock-data, utils)
Config: 4 (vite.config.ts, tsconfig.json, tailwind.config.js, package.json)
Total: ~45 files, all modular and <100 LOC each

Critical Design Decisions


React Context + Hooks Over Redux

Simpler, lighter-weight state management for this app's scope
DataContext holds all request/access data
useWorkflow hook handles complex state transitions
Reduces boilerplate while maintaining clarity



Workflow Engine as Single Source of Truth

All state transitions go through workflow engine
Prevents scattered business logic in components
Makes transitions testable and auditable
Called from dispatch actions in DataContext



Derived vs Stored Status

Never store computed status (pending, expiring-soon, expired)
Always derive from request/item data + timestamps
Eliminates sync bugs and inconsistent states
Computed in status-utils.ts, called from components



Context-Based Routing

No React Router overhead (optional: can add if needed later)
Current page state in AppContext
Navigation via simple dispatch action
Makes role switching instant



Role Guard at Component Level

Wraps sensitive features, not just pages
Provides better granular control
Shows appropriate fallback UI
Integrates with AppContext role state



Notification Bell with Context

Role-specific pending counts from useNotifications hook
Makes system feel reactive and real
Drives users to take action
Updates in real-time as data changes



Audit Log as Compliance Layer

Tracks all changes with who/when/what
Integrates timeline view with full audit history
Required for enterprise compliance
Immutable timestamp records in DataContext



Mock Data Strategy

Generate 25-30 requests with varied statuses using mock-data.ts
Requests distributed across Pending, HOD Approved, IT Approved, Active, Expired, Revoked
Each request has multiple access items
Include realistic approval timelines with comments and timestamps
Data persists in component state during session (no persistence layer needed for demo)