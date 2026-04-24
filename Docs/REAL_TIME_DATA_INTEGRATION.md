# Budget Portal - Real-Time Data Integration

## Overview
The Budget Portal has been updated to use **real-time database data** instead of static JSON files. The dashboard and reports now fetch live budget information, support product number search, and display quarterly budget details.

---

## Architecture Changes

### Frontend Changes

#### 1. **New API Service Layer** - `src/services/budgetApi.ts`
Provides centralized API communication with the backend:

```typescript
// Main API methods:
- getAllBudgets()                    // Get all active budgets
- getBudgetSummary(params?)          // Get summary with optional filtering
- getBudgetTrend(params?)            // Get trend data (monthly/quarterly/yearly)
- searchByProductNumber(productNo)   // Search budgets by product number
- getBudgetByProductNumber(productNo) // Get single budget by product
- getQuarterlyBudgetData(params?)    // Get quarterly breakdown
```

**Base URL**: Configured in `src/lib/portalConfig.ts` → `http://localhost:5000/api`

#### 2. **New API Hooks** - `src/hooks/useBudgetApi.ts`
React hooks for real-time data fetching with state management:

```typescript
// Hook functions:
useBudgetSummaryApi(params?)         // Real-time budget summary
useBudgetTrendApi(params?)           // Trend data for charts
useProductSearch(productNo)          // Search with debounce
useAllBudgets()                      // All budgets list
useBudgetByProductNumber(productNo)  // Single budget lookup
```

**Features**:
- Automatic loading/error state management
- Debounced search (300ms)
- Real-time re-fetching on parameter change

#### 3. **Updated Components**

**Dashboard.tsx** - Now uses real-time data:
```typescript
// Key changes:
- Added product number search input
- Added period selection (monthly/quarterly/yearly)
- Displays loading states while fetching
- Shows error messages if API calls fail
- All metrics update based on filters
```

**ReportPage.tsx** - Complete refactor:
```typescript
// Key changes:
- Product number search replaces project selector
- Real-time summary cards from API
- Dynamic trend charts based on period selection
- Loading indicators for data fetching
- Error handling with user-friendly messages
```

**BudgetMetricCard.tsx** - Enhanced with loading state:
```typescript
// Added:
- `loading?: boolean` prop
- Skeleton/pulse animation during loading
- Better visual feedback for data refresh
```

---

## Backend API Endpoints

### Base Route: `/api/budgets/`

#### 1. **GET /api/budgets/**
Get all active budgets
```json
Response: BudgetRecord[]
```

#### 2. **GET /api/budgets/search?productNo={term}**
Search budgets by product number
```
Parameters:
  - productNo: string (e.g., "NPD-2025-08")

Response: BudgetRecord[]
```

#### 3. **GET /api/budgets/summary**
Get budget summary with optional filtering
```
Parameters:
  - productNo?: string (optional - filter by product)
  - period?: "monthly" | "quarterly" | "yearly"
  - from?: string (ISO date)
  - to?: string (ISO date)

Response: BudgetSummary {
  totalPlanned: number
  totalActual: number
  variance: number
  variancePct: number
  utilisationPct: number
  activeProjects: number
}
```

#### 4. **GET /api/budgets/summary/trend**
Get trend data for charts
```
Parameters:
  - type?: "monthly" | "quarterly" | "yearly"
  - productNo?: string (optional)
  - projectNumber?: string (optional)

Response: TrendPoint[] {
  label: string
  planned: number
  actual: number
  variance: number
}
```

#### 5. **GET /api/budgets/{budgetId}**
Get full budget details by ID
```
Response: BudgetRecord {
  id: string
  projectNumber: string
  productNumber: string
  productName: string
  phase: BudgetPhase
  status: 'active' | 'draft' | 'over-budget' | 'complete'
  fiscalYear: string
  lineItems: BudgetLineItem[]
}
```

#### 6. **GET /api/budgets/by-project/{productNo}**
Get budget by product number
```
Response: BudgetRecord | null
```

#### 7. **GET /api/budgets/by-project/{projectNumber}/product/{productNo}**
Get budget by both project and product codes
```
Response: BudgetRecord | null
```

#### 8. **GET /api/budgets/quarterly**
Get quarterly budget breakdown
```
Parameters:
  - productNo?: string
  - quarter?: "Q1" | "Q2" | "Q3" | "Q4"

Response: QuarterlyBudgetData {
  quarter: string
  items: Array<{
    itemName: string
    plannedAmount: number
    actualAmount: number
    category: string
  }>
}
```

---

## Data Flow Diagram

### Before (Static Data):
```
Client Component
    ↓
useBudgetData Hook
    ↓
budgetRecord.json (static)
    ↓
Component Renders
```

### After (Real-Time from Database):
```
Client Component (Dashboard/ReportPage)
    ↓
useBudgetApi Hook (New)
    ↓
budgetApi Service (New)
    ↓
Backend API (/api/budgets/*)
    ↓
Database Query (Oracle/MySQL)
    ↓
Component Renders with Real-Time Data
```

---

## Features Implemented

### ✅ 1. Real-Time Data Display
- Dashboard metrics update from live database
- No static data caching (except for React rendering optimization)
- Immediate reflection of budget changes

### ✅ 2. Product Number Search
- Search input on both Dashboard and Reports
- Debounced API calls (300ms delay)
- Real-time filtered results
- Support for product codes like "NPD-2025-08"

### ✅ 3. Dynamic Period Selection
- Monthly, Quarterly, Yearly views
- Charts update based on selected period
- API returns aggregated data for each period

### ✅ 4. Quarterly Budget Filtering
- Dedicated quarterly endpoint
- Get budget items grouped by quarter
- Breakdown by category within each quarter

### ✅ 5. Loading States & Error Handling
- Visual loading indicators (skeleton screens)
- Error messages displayed to user
- Graceful fallbacks for failed API calls

### ✅ 6. Amount & Count as Real-Time DB Values
- All monetary amounts fetched from database
- Count of active projects is live
- No hard-coded or static values

---

## Usage Examples

### Example 1: Get Dashboard Summary for a Specific Product
```typescript
const { summary, loading, error } = useBudgetSummaryApi({
  productNo: "NPD-2025-08",
  period: "quarterly"
})

// Returns: {
//   totalPlanned: 66,70,636,
//   totalActual: 41,27,500,
//   variance: 25,43,136,
//   variancePct: 38.1,
//   utilisationPct: 61.9,
//   activeProjects: 6
// }
```

### Example 2: Get Trend Data for Charts
```typescript
const { trend, loading } = useBudgetTrendApi({
  type: "quarterly",
  productNo: "NPD-2025-08"
})

// Returns: [
//   { label: "Q1", planned: 1000000, actual: 900000, variance: 100000 },
//   { label: "Q2", planned: 1500000, actual: 1200000, variance: 300000 },
//   ...
// ]
```

### Example 3: Search by Product Number
```typescript
const { budgets, loading, error } = useProductSearch("NPD-2025")

// Returns: [
//   { id: "...", projectNumber: "...", productNumber: "NPD-2025-08", ... },
//   { id: "...", projectNumber: "...", productNumber: "NPD-2025-09", ... },
// ]
```

---

## Configuration

### API Base URL
Located in: `src/lib/portalConfig.ts`

```typescript
export const PORTAL_CONFIG = {
  apiBaseUrl: "http://localhost:5000/api",
  // ... other config
}
```

Update this when deploying to production:
```typescript
apiBaseUrl: "https://your-api-domain.com/api"
```

---

## Database Support

The backend supports multiple databases (configured per environment):
- **Oracle** (Primary for production)
- **MySQL** (Fallback)
- **SQLite** (Development)

Determined at startup via: `appsettings.Development.json` / `appsettings.Production.json`

---

## Performance Considerations

### Optimizations Implemented:
1. **Debounced Search** - 300ms delay to reduce API calls
2. **React Query Ready** - Hook structure supports easy migration to React Query
3. **Lazy Loading** - Data fetched on component mount only when needed
4. **Error Boundaries** - Graceful error handling without crashes

### Future Optimizations:
1. Implement React Query for advanced caching
2. Add pagination to `getAllBudgets()` endpoint
3. Implement real-time WebSocket updates for live sync
4. Add request cancellation for outdated queries

---

## Testing Checklist

- [ ] Dashboard loads with real API data
- [ ] Product search returns matching budgets
- [ ] Period selection updates charts
- [ ] Error messages display on API failure
- [ ] Loading states show during data fetch
- [ ] Budget amounts match database values
- [ ] Active project count is accurate
- [ ] Reports update when product number changes
- [ ] Quarterly budget data displays correctly
- [ ] No console errors or warnings

---

## Migration Notes

### Old Code (Still Available - Do Not Use):
- `src/hooks/useBudgetData.ts` - Uses static JSON
- `src/data/budgetRecord.json` - Static data file

These are kept for reference but should not be used in new components.

### Migration Path for Existing Components:
If other components still use `useBudgetData`:
```typescript
// OLD (Do not use):
import { useBudgetSummary } from '@/hooks/useBudgetData'

// NEW (Use this instead):
import { useBudgetSummaryApi } from '@/hooks/useBudgetApi'
```

---

## Troubleshooting

### Issue: API Returns 404
**Solution**: Ensure backend is running on `http://localhost:5000` and routes are correctly configured.

### Issue: Search returns no results
**Solution**: Check product number format - should match database entries exactly (e.g., "NPD-2025-08")

### Issue: Data shows as "..." or loading forever
**Solution**: Check browser DevTools → Network tab for failed API requests. Verify backend error logs.

### Issue: CORS errors
**Solution**: Backend needs CORS headers configured. Check `Server/Api/Program.cs` for CORS setup.

---

## Next Steps / Future Enhancements

1. **Real-Time Updates**
   - Implement WebSocket for live budget updates
   - Push notifications for budget alerts

2. **Advanced Filtering**
   - Filter by date range
   - Filter by budget status
   - Filter by project phase

3. **Export Functionality**
   - PDF/Excel exports with real-time data
   - Scheduled report generation

4. **Analytics Dashboard**
   - Budget vs Actual analysis
   - Trend predictions
   - Variance alerts

5. **Caching Strategy**
   - Implement React Query
   - Service worker for offline mode
   - Cache invalidation logic

---

## Support

For issues or questions:
1. Check API response in Network tab
2. Review browser console for errors
3. Verify backend is responding to requests
4. Check `Server/Api/Program.cs` for endpoint configuration
