# Requisition for Component Development - API Endpoints Documentation

## Base URL
```
{BASE_URL}/api
```

---

## Table of Contents
1. [Authentication](#authentication)
2. [Requisitions](#requisitions)
3. [Data Models](#data-models)
4. [Error Responses](#error-responses)

---

## Authentication

### Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "name": "string",
    "role": "admin | manager | viewer",
    "avatarUrl": "string (optional)"
  },
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)"
}
```

---

### Refresh Token
**Endpoint:** `POST /auth/refresh`

**Description:** Refresh access token using refresh token.

**Request Headers:**
```
Authorization: Bearer {refreshToken}
```

**Response (200 OK):**
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)"
}
```

---

### Logout
**Endpoint:** `POST /auth/logout`

**Description:** Invalidate current session.

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Requisitions

### Get All Requisitions
**Endpoint:** `GET /requisitions`

**Description:** Fetch all requisition documents with pagination and filtering support.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Records per page (default: 10) |
| `status` | string | No | Filter by status: `draft`, `pending`, `approved` |
| `search` | string | No | Search by recNo, productName, projectNo |
| `sortBy` | string | No | Sort field: `recNo`, `date`, `status` |
| `sortOrder` | string | No | Sort order: `asc`, `desc` |

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "recNo": "REC-2024-001",
      "date": "2024-06-01",
      "pageNo": "1 of 1",
      "fromTeam": "Design & Development Team",
      "toTeam": "Materials - D&D",
      "productNo": "PRD-001",
      "productRev": "1.0",
      "projectNo": "PROJ-2024",
      "productName": "Smart IoT Device v2",
      "purpose": "new-product-validation",
      "monthlyQty": 5000,
      "status": "approved",
      "parts": [
        {
          "sNo": 1,
          "partNo": "PART-001",
          "rev": "A",
          "partName": "Microcontroller MCU32",
          "qty": 500,
          "requiredDate": "2024-06-15",
          "committedDate": "2024-06-10",
          "actualCompletionDate": "2024-06-09"
        }
      ],
      "preparedBy": "John Doe",
      "preparedDate": "2024-06-01",
      "checkedBy": "Jane Smith",
      "checkedDate": "2024-06-02",
      "approvedBy": "Admin User",
      "approvedDate": "2024-06-03",
      "receivedBy": "Store Manager",
      "receivedDate": "2024-06-04",
      "createdAt": "2024-06-01T10:00:00Z",
      "updatedAt": "2024-06-04T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

---

### Get Single Requisition
**Endpoint:** `GET /requisitions/{recNo}`

**Description:** Fetch a single requisition document by record number.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recNo` | string | Yes | Requisition record number (e.g., REC-2024-001) |

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "recNo": "REC-2024-001",
  "date": "2024-06-01",
  "pageNo": "1 of 1",
  "fromTeam": "Design & Development Team",
  "toTeam": "Materials - D&D",
  "productNo": "PRD-001",
  "productRev": "1.0",
  "projectNo": "PROJ-2024",
  "productName": "Smart IoT Device v2",
  "purpose": "new-product-validation",
  "monthlyQty": 5000,
  "status": "approved",
  "parts": [
    {
      "sNo": 1,
      "partNo": "PART-001",
      "rev": "A",
      "partName": "Microcontroller MCU32",
      "qty": 500,
      "requiredDate": "2024-06-15",
      "committedDate": "2024-06-10",
      "actualCompletionDate": "2024-06-09"
    }
  ],
  "preparedBy": "John Doe",
  "preparedDate": "2024-06-01",
  "checkedBy": "Jane Smith",
  "checkedDate": "2024-06-02",
  "approvedBy": "Admin User",
  "approvedDate": "2024-06-03",
  "receivedBy": "Store Manager",
  "receivedDate": "2024-06-04",
  "createdAt": "2024-06-01T10:00:00Z",
  "updatedAt": "2024-06-04T14:30:00Z"
}
```

---

### Create Requisition
**Endpoint:** `POST /requisitions`

**Description:** Create a new requisition document. The system auto-generates `recNo` and `date` if not provided.

**Request Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

#### CreateRequisitionRequest Model
```typescript
{
  // Document Meta (all required)
  "date": "2026-05-15",                           // ISO 8601 date format
  "pageNo": "1 of 1",                              // Page reference
  "fromTeam": "Design & Development Team",         // Source team
  "toTeam": "Materials - D&D",                     // Destination team

  // Product Information (all required)
  "productNo": "PRD-001",                           // Product code
  "productRev": "1.0",                              // Product revision
  "projectNo": "PROJ-2024",                         // Project identifier
  "productName": "Smart IoT Device v2",             // Product name
  "purpose": "new-product-validation",              // Purpose: "new-product-validation" | "sales"
  "monthlyQty": "5000",                             // Estimated monthly quantity

  // Component Breakdown (optional - can be empty array initially)
  "parts": [
    {
      "partNo": "PART-001",                         // Part number
      "rev": "A",                                    // Part revision
      "partName": "Microcontroller MCU32",          // Part name
      "qty": 500,                                    // Quantity required
      "requiredDate": "2024-06-15",                 // Required delivery date (ISO 8601)
      "committedDate": "2024-06-10",                // Committed delivery date (ISO 8601)
      "actualCompletionDate": ""                    // Actual completion (optional, empty for new)
    }
  ],

  // Signature Information (optional - can be populated later)
  "signatures": {
    "prepared": {
      "name": "John Doe",                           // Prepared by person name
      "date": "2026-05-15 09:00 AM"                // Preparation timestamp
    },
    "checked": {
      "name": "Jane Smith",                         // Checked by person name
      "date": "2026-05-15 10:00 AM"                // Check timestamp
    },
    "approved": {
      "name": "",                                    // Approved by (optional)
      "date": ""                                     // Approval timestamp (optional)
    },
    "received": {
      "name": "",                                    // Received by (optional)
      "date": ""                                     // Receipt timestamp (optional)
    }
  },

  // Compliance Flag
  "moqWarningAccepted": true                        // User acknowledged MOQ warning
}
```

**Full Request Example:**
```json
{
  "date": "2026-05-15",
  "pageNo": "1 of 1",
  "fromTeam": "Design & Development Team",
  "toTeam": "Materials - D&D",
  "productNo": "P-88391",
  "productRev": "02",
  "projectNo": "PRJ-9910",
  "productName": "High-Pressure Solenoid Valve 1/2\"",
  "purpose": "new-product-validation",
  "monthlyQty": "500",
  "parts": [
    {
      "partNo": "PT-001-A",
      "rev": "01",
      "partName": "Aluminum Valve Body Plunger",
      "qty": 10,
      "requiredDate": "2026-05-20",
      "committedDate": "2026-05-19",
      "actualCompletionDate": ""
    },
    {
      "partNo": "PT-042-B",
      "rev": "00",
      "partName": "NBR Nitrile Rubber O-Ring Seal",
      "qty": 50,
      "requiredDate": "2026-05-20",
      "committedDate": "2026-05-22",
      "actualCompletionDate": ""
    }
  ],
  "signatures": {
    "prepared": {
      "name": "Alex Kumar",
      "date": "2026-05-15 09:00 AM"
    },
    "checked": {
      "name": "Sarah Jenkins",
      "date": "2026-05-15 10:15 AM"
    },
    "approved": {
      "name": "",
      "date": ""
    },
    "received": {
      "name": "",
      "date": ""
    }
  },
  "moqWarningAccepted": true
}
```

**Response (201 Created):**

#### CreateRequisitionResponse Model
```json
{
  "success": true,
  "message": "Requisition created successfully",
  "data": {
    "recNo": "REC-2026-042",                        // Auto-generated record number
    "date": "2026-05-15",
    "pageNo": "1 of 1",
    "fromTeam": "Design & Development Team",
    "toTeam": "Materials - D&D",
    "productNo": "P-88391",
    "productRev": "02",
    "projectNo": "PRJ-9910",
    "productName": "High-Pressure Solenoid Valve 1/2\"",
    "purpose": "new-product-validation",
    "monthlyQty": 500,
    "status": "draft",
    "parts": [
      {
        "sNo": 1,
        "partNo": "PT-001-A",
        "rev": "01",
        "partName": "Aluminum Valve Body Plunger",
        "qty": 10,
        "requiredDate": "2026-05-20",
        "committedDate": "2026-05-19",
        "actualCompletionDate": ""
      },
      {
        "sNo": 2,
        "partNo": "PT-042-B",
        "rev": "00",
        "partName": "NBR Nitrile Rubber O-Ring Seal",
        "qty": 50,
        "requiredDate": "2026-05-20",
        "committedDate": "2026-05-22",
        "actualCompletionDate": ""
      }
    ],
    "preparedBy": "Alex Kumar",
    "preparedDate": "2026-05-15T09:00:00Z",
    "checkedBy": "Sarah Jenkins",
    "checkedDate": "2026-05-15T10:15:00Z",
    "approvedBy": null,
    "approvedDate": null,
    "receivedBy": null,
    "receivedDate": null,
    "createdAt": "2026-05-15T09:00:00Z",
    "updatedAt": "2026-05-15T09:00:00Z"
  }
}
```

---

### Update Requisition
**Endpoint:** `PUT /requisitions/{recNo}`

**Description:** Update an existing requisition document. Only draft and pending requisitions can be updated.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recNo` | string | Yes | Requisition record number |

**Request Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** Same as Create Requisition (partial updates supported)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Requisition updated successfully",
  "data": {
    // Full updated requisition object (same as Create response)
  }
}
```

---

### Approve Requisition
**Endpoint:** `POST /requisitions/{recNo}/approve`

**Description:** Approve a requisition document (admin/manager only). Transitions status from pending to approved.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recNo` | string | Yes | Requisition record number |

**Request Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "approvedBy": "Admin User",
  "approvalDate": "2026-05-15T14:00:00Z",
  "comments": "Approved for procurement"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Requisition approved successfully",
  "data": {
    "recNo": "REC-2026-042",
    "status": "approved",
    "approvedBy": "Admin User",
    "approvedDate": "2026-05-15T14:00:00Z"
  }
}
```

---

### Submit Requisition (Check)
**Endpoint:** `POST /requisitions/{recNo}/submit`

**Description:** Submit a draft requisition for review. Transitions status from draft to pending.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recNo` | string | Yes | Requisition record number |

**Request Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "checkedBy": "Jane Smith",
  "checkDate": "2026-05-15T10:15:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Requisition submitted for approval",
  "data": {
    "recNo": "REC-2026-042",
    "status": "pending",
    "checkedBy": "Jane Smith",
    "checkedDate": "2026-05-15T10:15:00Z"
  }
}
```

---

### Delete Requisition
**Endpoint:** `DELETE /requisitions/{recNo}`

**Description:** Delete a requisition document. Only draft requisitions can be deleted.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recNo` | string | Yes | Requisition record number |

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Requisition deleted successfully"
}
```

---

### Export Requisition
**Endpoint:** `GET /requisitions/{recNo}/export`

**Description:** Export requisition as PDF or Excel.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Export format: `pdf`, `excel` (default: pdf) |

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
- Content-Type: `application/pdf` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Binary file content

---

## Data Models

### Part Model
```typescript
interface Part {
  sNo: number;
  partNo: string;
  rev: string;
  partName: string;
  qty: number;
  requiredDate: string;          // ISO 8601 date
  committedDate: string;          // ISO 8601 date
  actualCompletionDate: string;   // ISO 8601 date or empty
}
```

### Signature Model
```typescript
interface Signature {
  name: string;
  date: string;                   // ISO 8601 datetime or custom format
}
```

### Requisition Status
```
draft        - Initial state after creation
pending      - Submitted for review/approval
approved     - Approved by authorized personnel
rejected     - Rejected during review
completed    - Materials received and confirmed
archived     - Historical record, no further changes
```

### User Roles & Permissions
```
admin:
  - Create, read, update, delete requisitions
  - Approve/reject requisitions
  - Export requisitions
  - Manage users and permissions

manager:
  - Create, read, update own requisitions
  - Submit requisitions for approval
  - Export requisitions
  - View team requisitions

viewer:
  - Read-only access to requisitions
  - Export requisitions (read-only)
  - No create/update/delete permissions
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "productName",
        "message": "Product name is required"
      },
      {
        "field": "parts",
        "message": "At least one part must be added"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or invalid"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Requisition REC-2026-042 not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot update approved requisition. Only draft and pending requisitions can be modified."
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please contact support."
  }
}
```

---

## Implementation Notes

### Workflow States
1. **Create** → `draft`
2. **Submit** (Step 3 finish) → `pending` (checkedBy populated)
3. **Approve** → `approved` (approvedBy populated)
4. **Receive** → `completed` (receivedBy populated)

### Auto-Generated Fields
- `recNo`: Generated as `REC-{YYYY}-{SEQUENCE}` format
- `createdAt`, `updatedAt`: Server timestamps
- `sNo` in parts: Auto-incremented based on array index

### Validation Rules
- `productName`, `projectNo`, `productNo`, `purpose` are required
- At least 1 part must be added before submission
- `requiredDate` must be >= `committedDate`
- Dates must be in ISO 8601 format (YYYY-MM-DD)
- `monthlyQty` must be positive integer
- `moqWarningAccepted` must be true before submission

### Authentication
All endpoints (except Login) require valid JWT token in `Authorization: Bearer {token}` header.

### Rate Limiting
- 100 requests per minute per user
- 1000 requests per minute per IP

### Pagination
Default page size: 10, max page size: 100

---

## Example Flow

### Complete Create → Submit → Approve Workflow

#### 1. Create Requisition (Draft)
```bash
POST /api/requisitions
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2026-05-15",
  "pageNo": "1 of 1",
  "fromTeam": "Design & Development Team",
  "toTeam": "Materials - D&D",
  "productNo": "P-88391",
  "productRev": "02",
  "projectNo": "PRJ-9910",
  "productName": "High-Pressure Solenoid Valve 1/2\"",
  "purpose": "new-product-validation",
  "monthlyQty": "500",
  "parts": [...],
  "signatures": {...},
  "moqWarningAccepted": true
}

Response: 201
{
  "data": {
    "recNo": "REC-2026-042",
    "status": "draft",
    ...
  }
}
```

#### 2. Submit for Review (Pending)
```bash
POST /api/requisitions/REC-2026-042/submit
Authorization: Bearer {token}

{
  "checkedBy": "Jane Smith",
  "checkDate": "2026-05-15T10:15:00Z"
}

Response: 200
{
  "data": {
    "recNo": "REC-2026-042",
    "status": "pending",
    "checkedBy": "Jane Smith",
    ...
  }
}
```

#### 3. Approve Requisition
```bash
POST /api/requisitions/REC-2026-042/approve
Authorization: Bearer {admin-token}

{
  "approvedBy": "Admin User",
  "approvalDate": "2026-05-15T14:00:00Z"
}

Response: 200
{
  "data": {
    "recNo": "REC-2026-042",
    "status": "approved",
    "approvedBy": "Admin User",
    ...
  }
}
```

---

**Last Updated:** May 15, 2026
**Version:** 1.0
