# Budget Portal API Contract Specification

## API Base URL
```
Development: http://localhost:5000/api
Production: https://your-api-domain.com/api
```

---

## Endpoints Specification

### 1. Get All Budgets
```
GET /api/budgets/
```

**Description:** Fetch all active budgets from the database

**Parameters:** None

**Response Type:** `BudgetRecord[]`

**Response Example:**
```json
[
  {
    "id": "budget-001",
    "projectNumber": "NPD-2025-07",
    "productNumber": "NPD-2025-08",
    "productName": "Product Name",
    "phase": "Product Design",
    "status": "active",
    "fiscalYear": "FY2024-25",
    "lastSyncedAt": "2025-04-20T10:30:00Z",
    "lineItems": [
      {
        "id": "item-001",
        "category": "R&D",
        "subcategory": "Engineering",
        "plannedAmount": 5000000,
        "actualAmount": 4500000,
        "period": {
          "month": 4,
          "fiscalYear": "FY2024-25"
        }
      }
    ]
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database error

---

### 2. Search Budgets by Product Number
```
GET /api/budgets/search?productNo={productNo}
```

**Description:** Search budgets using product number with wildcard support

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productNo` | string | ✓ | Product number to search (e.g., "NPD-2025-08") |

**Response Type:** `BudgetRecord[]`

**Response Example:**
```json
[
  {
    "id": "budget-001",
    "projectNumber": "NPD-2025-07",
    "productNumber": "NPD-2025-08",
    "productName": "New Product Development",
    "phase": "Product Design",
    "status": "active",
    "fiscalYear": "FY2024-25",
    "lineItems": []
  }
]
```

**Status Codes:**
- `200 OK` - Success (returns empty array if no matches)
- `400 Bad Request` - Missing productNo parameter
- `500 Internal Server Error` - Database error

**Example Requests:**
```bash
# Exact match
GET /api/budgets/search?productNo=NPD-2025-08

# Wildcard search
GET /api/budgets/search?productNo=NPD-2025

# URL encoded special characters
GET /api/budgets/search?productNo=NPD%2D2025%2D08
```

---

### 3. Get Budget Summary
```
GET /api/budgets/summary
```

**Description:** Get aggregated budget summary with optional filtering

**Parameters:**
| Name | Type | Required | Description | Default |
|------|------|----------|-------------|---------|
| `productNo` | string | ✗ | Filter by product number | All products |
| `period` | string | ✗ | Time period: "monthly", "quarterly", "yearly" | All time |
| `from` | string (ISO 8601) | ✗ | Start date (e.g., "2025-04-01") | - |
| `to` | string (ISO 8601) | ✗ | End date (e.g., "2025-06-30") | - |

**Response Type:** `BudgetSummary`

**Response Structure:**
```typescript
{
  totalPlanned: number          // ₹66,70,636
  totalActual: number           // ₹41,27,500
  variance: number              // ₹25,43,136 (positive = under budget)
  variancePct: number           // 38.1 (percentage)
  utilisationPct: number        // 61.9 (percentage)
  activeProjects: number        // 6
}
```

**Response Example:**
```json
{
  "totalPlanned": 6670636,
  "totalActual": 4127500,
  "variance": 2543136,
  "variancePct": 38.1,
  "utilisationPct": 61.9,
  "activeProjects": 6
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid period value
- `500 Internal Server Error` - Database error

**Example Requests:**
```bash
# All budgets summary
GET /api/budgets/summary

# Specific product quarterly
GET /api/budgets/summary?productNo=NPD-2025-08&period=quarterly

# Date range summary
GET /api/budgets/summary?from=2025-04-01&to=2025-06-30

# Product + period + date range
GET /api/budgets/summary?productNo=NPD-2025-08&period=quarterly&from=2025-04-01&to=2025-06-30
```

---

### 4. Get Budget Trend Data
```
GET /api/budgets/summary/trend
```

**Description:** Get time-series trend data for charts

**Parameters:**
| Name | Type | Required | Description | Values |
|------|------|----------|-------------|--------|
| `type` | string | ✗ | Aggregation period | "monthly", "quarterly", "yearly" |
| `productNo` | string | ✗ | Filter by product number | - |
| `projectCode` | string | ✗ | Filter by project code | - |

**Response Type:** `TrendPoint[]`

**Response Structure:**
```typescript
[
  {
    label: string              // "Apr", "Q1", "FY2024-25"
    planned: number            // 1000000
    actual: number             // 900000
    variance: number           // 100000
  }
]
```

**Response Example:**
```json
[
  {
    "label": "Apr",
    "planned": 1000000,
    "actual": 900000,
    "variance": 100000
  },
  {
    "label": "May",
    "planned": 1200000,
    "actual": 1100000,
    "variance": 100000
  },
  {
    "label": "Jun",
    "planned": 1500000,
    "actual": 1300000,
    "variance": 200000
  }
]
```

**Trend Type Details:**
- **Monthly:** Last 6 months of fiscal year
- **Quarterly:** Last 4 quarters (Q1-Q4)
- **Yearly:** Last 5 fiscal years

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid type value
- `500 Internal Server Error` - Database error

**Example Requests:**
```bash
# Monthly trend for all products
GET /api/budgets/summary/trend?type=monthly

# Quarterly trend for specific product
GET /api/budgets/summary/trend?type=quarterly&productNo=NPD-2025-08

# Yearly trend for specific project
GET /api/budgets/summary/trend?type=yearly&projectCode=NPD-2025-07
```

---

### 5. Get Budget by ID
```
GET /api/budgets/{budgetId}
```

**Description:** Get full budget details including all line items and categories

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `budgetId` | string | ✓ | Budget ID (path parameter) |

**Response Type:** `BudgetRecord`

**Response Example:**
```json
{
  "id": "budget-001",
  "projectNumber": "NPD-2025-07",
  "productNumber": "NPD-2025-08",
  "productName": "New Product Development",
  "phase": "Product Design",
  "status": "active",
  "fiscalYear": "FY2024-25",
  "lastSyncedAt": "2025-04-20T10:30:00Z",
  "lineItems": [
    {
      "id": "item-001",
      "category": "R&D",
      "subcategory": "Engineering",
      "plannedAmount": 5000000,
      "actualAmount": 4500000,
      "period": {
        "month": 4,
        "fiscalYear": "FY2024-25"
      }
    },
    {
      "id": "item-002",
      "category": "Operations",
      "subcategory": "Logistics",
      "plannedAmount": 1500000,
      "actualAmount": 1200000,
      "period": {
        "month": 5,
        "fiscalYear": "FY2024-25"
      }
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Budget not found
- `500 Internal Server Error` - Database error

**Example Requests:**
```bash
GET /api/budgets/budget-001
```

---

### 6. Get Budget by Product Number
```
GET /api/budgets/by-project/{productNo}
```

**Description:** Get budget by product number (returns first matching budget)

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productNo` | string | ✓ | Product number (path parameter) |

**Response Type:** `BudgetRecord | null`

**Status Codes:**
- `200 OK` - Success (with budget data)
- `200 OK` - Success (with null if not found)
- `500 Internal Server Error` - Database error

**Example Requests:**
```bash
GET /api/budgets/by-project/NPD-2025-08
```

---

### 7. Get Budget by Project & Product Code
```
GET /api/budgets/by-project/{projectCode}/product/{productNo}
```

**Description:** Get budget by combining project code and product number

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `projectCode` | string | ✓ | Project code (path parameter) |
| `productNo` | string | ✓ | Product number (path parameter) |

**Response Type:** `BudgetRecord | null`

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Budget not found
- `500 Internal Server Error` - Database error

**Example Requests:**
```bash
GET /api/budgets/by-project/NPD-2025-07/product/NPD-2025-08
```

---

### 8. Get Quarterly Budget Data
```
GET /api/budgets/quarterly
```

**Description:** Get quarterly budget breakdown with detailed line items

**Parameters:**
| Name | Type | Required | Description | Values |
|------|------|----------|-------------|--------|
| `productNo` | string | ✗ | Product number to filter | - |
| `quarter` | string | ✗ | Quarter to filter | "Q1", "Q2", "Q3", "Q4" |

**Response Type:** `QuarterlyBudgetData | null`

**Response Structure:**
```typescript
{
  quarter: string              // "Q1"
  items: Array<{
    itemName: string           // "Engineering Costs"
    plannedAmount: number      // 5000000
    actualAmount: number       // 4500000
    category: string           // "R&D"
  }>
}
```

**Response Example:**
```json
{
  "quarter": "Q1",
  "items": [
    {
      "itemName": "Engineering Costs",
      "plannedAmount": 5000000,
      "actualAmount": 4500000,
      "category": "R&D"
    },
    {
      "itemName": "Testing & QA",
      "plannedAmount": 1500000,
      "actualAmount": 1400000,
      "category": "R&D"
    },
    {
      "itemName": "Logistics",
      "plannedAmount": 1000000,
      "actualAmount": 900000,
      "category": "Operations"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - No quarterly data found
- `500 Internal Server Error` - Database error

**Example Requests:**
```bash
# Get all quarterly data
GET /api/budgets/quarterly

# Get Q1 for specific product
GET /api/budgets/quarterly?quarter=Q1&productNo=NPD-2025-08

# Get Q3 data
GET /api/budgets/quarterly?quarter=Q3
```

---

## Data Models

### BudgetRecord
```typescript
interface BudgetRecord {
  id: string                    // Unique identifier
  projectNumber: string         // "NPD-2025-07"
  productNumber: string         // "NPD-2025-08" or "PROD-SOL-2025-07"
  productName: string           // "New Product Development"
  phase: BudgetPhase           // "Product Design" | "Concept Development" | etc
  status: 'active' | 'draft' | 'over-budget' | 'complete'
  fiscalYear: string           // "FY2024-25"
  lastSyncedAt: string         // ISO 8601 timestamp
  lineItems: BudgetLineItem[]
}
```

### BudgetPhase
```typescript
type BudgetPhase = 
  | "Product Design"
  | "Concept Development"
  | "Prototype Development"
  | "Product Testing"
  | "Capital Equipment"
  | "Field Validation"
```

### BudgetLineItem
```typescript
interface BudgetLineItem {
  id: string
  category: string             // "R&D", "Operations", etc
  subcategory: string          // "Engineering", "Logistics", etc
  plannedAmount: number        // In rupees
  actualAmount: number         // READ-ONLY from ERP
  period: {
    month?: number             // 1-12
    quarter?: 'Q1'|'Q2'|'Q3'|'Q4'
    fiscalYear: string        // "FY2024-25"
  }
}
```

### BudgetSummary
```typescript
interface BudgetSummary {
  totalPlanned: number         // Sum of all planned amounts
  totalActual: number          // Sum of all actual amounts
  variance: number             // planned - actual
  variancePct: number          // (variance / totalPlanned) * 100
  utilisationPct: number       // (totalActual / totalPlanned) * 100
  activeProjects: number       // Count of active projects
}
```

### TrendPoint
```typescript
interface TrendPoint {
  label: string                // "Apr", "Q1", "FY2024-25"
  planned: number
  actual: number
  variance: number             // planned - actual
}
```

### QuarterlyBudgetData
```typescript
interface QuarterlyBudgetData {
  quarter: string              // "Q1", "Q2", "Q3", "Q4"
  items: Array<{
    itemName: string           // Budget line item name
    plannedAmount: number
    actualAmount: number
    category: string           // Grouping category
  }>
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Description of the error",
  "errors": [
    "Specific error 1",
    "Specific error 2"
  ]
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Budget data returned |
| 400 | Bad Request | Invalid parameter value |
| 404 | Not Found | Budget doesn't exist |
| 500 | Server Error | Database connection failed |
| 503 | Service Unavailable | Database is down |

---

## Rate Limiting & Performance Notes

- **Search requests:** Debounced to 300ms to reduce load
- **No pagination:** All endpoints return complete results
- **Response time target:** <500ms for most queries
- **Max result size:** Depends on database capacity

---

## Example Usage Patterns

### Pattern 1: Get Dashboard Summary
```bash
curl -X GET "http://localhost:5000/api/budgets/summary?productNo=NPD-2025-08&period=quarterly"
```

### Pattern 2: Search Products
```bash
curl -X GET "http://localhost:5000/api/budgets/search?productNo=NPD-2025"
```

### Pattern 3: Get Trend Data
```bash
curl -X GET "http://localhost:5000/api/budgets/summary/trend?type=monthly&productNo=NPD-2025-08"
```

### Pattern 4: Get Quarterly Breakdown
```bash
curl -X GET "http://localhost:5000/api/budgets/quarterly?quarter=Q1&productNo=NPD-2025-08"
```

---

## Frontend Integration

### Using the API Service

```typescript
import { budgetApiService } from '@/services/budgetApi'

// Get summary
const summary = await budgetApiService.getBudgetSummary({
  productNo: "NPD-2025-08",
  period: "quarterly"
})

// Search
const results = await budgetApiService.searchByProductNumber("NPD-2025")

// Get trend
const trend = await budgetApiService.getBudgetTrend({
  type: "monthly",
  productNo: "NPD-2025-08"
})
```

### Using React Hooks

```typescript
import { useBudgetSummaryApi, useBudgetTrendApi } from '@/hooks/useBudgetApi'

function MyComponent() {
  const { summary, loading, error } = useBudgetSummaryApi({
    productNo: "NPD-2025-08",
    period: "quarterly"
  })

  const { trend } = useBudgetTrendApi({
    type: "monthly"
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Render with summary and trend */}</div>
}
```

---

## Testing

### Test API Endpoints with Curl

```bash
# Test all budgets endpoint
curl http://localhost:5000/api/budgets/

# Test search
curl "http://localhost:5000/api/budgets/search?productNo=NPD-2025-08"

# Test summary with parameters
curl "http://localhost:5000/api/budgets/summary?productNo=NPD-2025-08&period=quarterly"

# Test trend
curl "http://localhost:5000/api/budgets/summary/trend?type=monthly"

# Test quarterly
curl "http://localhost:5000/api/budgets/quarterly?quarter=Q1"
```

### Verify Response Format
Each endpoint should return properly formatted JSON with the response type specified in this document.

---

## Version History

- **v1.0** - Initial implementation with 8 endpoints
  - Summary endpoint with filtering
  - Trend data for charts
  - Product search with wildcard support
  - Quarterly breakdown support
