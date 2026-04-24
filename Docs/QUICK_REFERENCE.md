# Quick Reference Guide - Budget Portal Real-Time Integration

## 🚀 Quick Start

### 1. Display Real-Time Dashboard Data
```typescript
import { useBudgetSummaryApi } from '@/hooks/useBudgetApi'

export function Dashboard() {
  const { summary, loading } = useBudgetSummaryApi({
    period: 'monthly'
  })

  return (
    <div>
      <h2>Total Budget: ₹{summary?.totalPlanned || 0}</h2>
      <h2>Actual Spent: ₹{summary?.totalActual || 0}</h2>
      {loading && <p>Updating...</p>}
    </div>
  )
}
```

### 2. Search by Product Number
```typescript
import { useProductSearch } from '@/hooks/useBudgetApi'

export function SearchBox() {
  const [search, setSearch] = useState('')
  const { budgets, loading } = useProductSearch(search)

  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search product..."
      />
      {budgets.map(b => <div key={b.id}>{b.productNumber}</div>)}
    </div>
  )
}
```

### 3. Display Quarterly Trend
```typescript
import { useBudgetTrendApi } from '@/hooks/useBudgetApi'

export function Charts() {
  const { trend } = useBudgetTrendApi({
    type: 'quarterly',
    productNo: 'NPD-2025-08'
  })

  return (
    <Chart data={trend.map(t => ({
      x: t.label,
      y: t.variance
    }))} />
  )
}
```

---

## 📊 Common API Calls

| Task | Hook | Parameters |
|------|------|-----------|
| Get budget summary | `useBudgetSummaryApi` | `{ productNo?, period? }` |
| Get trend data | `useBudgetTrendApi` | `{ type?, productNo? }` |
| Search products | `useProductSearch` | `productNo string` |
| Get all budgets | `useAllBudgets` | - |
| Get single budget | `useBudgetByProductNumber` | `productNo string` |

---

## 💡 Code Examples

### Example: Filter Dashboard by Product
```typescript
const [productNo, setProductNo] = useState('')

const { summary, loading } = useBudgetSummaryApi({
  productNo: productNo || undefined,
  period: 'quarterly'
})

return (
  <>
    <input 
      value={productNo}
      onChange={(e) => setProductNo(e.target.value)}
    />
    {loading ? 'Loading...' : `Total: ₹${summary?.totalPlanned}`}
  </>
)
```

### Example: Dynamic Period Selection
```typescript
const [period, setPeriod] = useState<ReportPeriod>('monthly')

const { summary } = useBudgetSummaryApi({ period })
const { trend } = useBudgetTrendApi({ type: period })

return (
  <>
    <select value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)}>
      <option value="monthly">Monthly</option>
      <option value="quarterly">Quarterly</option>
      <option value="yearly">Yearly</option>
    </select>
    {/* Displays update based on selected period */}
  </>
)
```

### Example: Show Loading State
```typescript
const { summary, loading, error } = useBudgetSummaryApi()

if (error) return <ErrorAlert message={error.message} />
if (loading) return <LoadingSpinner />

return <DashboardCards summary={summary} />
```

---

## 🔧 Configuration

### Change API URL (for production)
**File:** `src/lib/portalConfig.ts`
```typescript
export const PORTAL_CONFIG = {
  apiBaseUrl: "https://production-api.com/api",  // ← Update this
  // ...
}
```

---

## 📋 Data Structures at a Glance

### BudgetSummary
```typescript
{
  totalPlanned: 6670636,      // ₹
  totalActual: 4127500,       // ₹
  variance: 2543136,          // ₹ (positive = under budget)
  variancePct: 38.1,          // %
  utilisationPct: 61.9,       // %
  activeProjects: 6           // count
}
```

### TrendPoint
```typescript
{
  label: "Q1",                // Period label
  planned: 1000000,           // ₹
  actual: 900000,             // ₹
  variance: 100000            // ₹
}
```

### BudgetRecord
```typescript
{
  id: "budget-001",
  productNumber: "NPD-2025-08",
  projectNumber: "NPD-2025-07",
  productName: "Product Name",
  phase: "Product Design",
  status: "active",
  fiscalYear: "FY2024-25",
  lineItems: []               // Array of line items
}
```

---

## 🎯 Common Scenarios

### Scenario 1: User Types Product Number
```
User types "NPD-2025" → 
useProductSearch debounces 300ms →
API searches database →
Results show matching products
```

### Scenario 2: User Changes Period Filter
```
User clicks "Quarterly" →
State updates to period: 'quarterly' →
useBudgetTrendApi re-fetches with new type →
Charts update with quarterly aggregation
```

### Scenario 3: User Searches and Filters
```
User enters product number and selects quarterly →
Both useBudgetSummaryApi and useBudgetTrendApi →
Called with same productNo and period →
Both fetch and display filtered results
```

---

## ⚠️ Common Mistakes

❌ **WRONG:** Using old static data hook
```typescript
import { useBudgetSummary } from '@/hooks/useBudgetData'
```

✅ **CORRECT:** Use new API hook
```typescript
import { useBudgetSummaryApi } from '@/hooks/useBudgetApi'
```

---

❌ **WRONG:** Not handling loading state
```typescript
return <div>{summary.totalPlanned}</div>  // Crashes if loading
```

✅ **CORRECT:** Handle all states
```typescript
if (loading) return <div>Loading...</div>
if (error) return <div>Error!</div>
return <div>{summary?.totalPlanned}</div>
```

---

❌ **WRONG:** Not debouncing search
```typescript
const { budgets } = useProductSearch(productNo)
// This calls API on every keystroke!
```

✅ **CORRECT:** Debounce is built-in
```typescript
const { budgets } = useProductSearch(productNo)
// Already debounced 300ms automatically
```

---

## 🧪 Testing the Integration

### Test 1: Verify Real Data
```bash
# Check that API returns actual database values
curl http://localhost:5000/api/budgets/summary
# Should return real amounts, not hard-coded values
```

### Test 2: Verify Search Works
```bash
# Product should exist in database
curl "http://localhost:5000/api/budgets/search?productNo=NPD-2025-08"
# Should return matching budget
```

### Test 3: Verify Period Aggregation
```bash
# Check monthly vs quarterly differences
curl "http://localhost:5000/api/budgets/summary/trend?type=monthly"
curl "http://localhost:5000/api/budgets/summary/trend?type=quarterly"
# Quarterly variance should be sum of 3 months
```

---

## 📞 Support

| Issue | Check | Solution |
|-------|-------|----------|
| API returns 404 | Network tab in DevTools | Backend running on port 5000? |
| Search empty | Product format | Use exact format like "NPD-2025-08" |
| Data showing "Loading..." | Network tab | Check API response time |
| CORS error | Browser console | Backend needs CORS enabled |
| Amount shows ₹0 | Database | Data exists for that product? |

---

## 🔄 Refresh Data

### Manual Refresh
```typescript
const { summary, loading } = useBudgetSummaryApi()

// Data auto-refetches when:
// 1. Component mounts
// 2. Parameters change (productNo, period)
// 3. Dependency array updates

// No manual refresh needed - automatic!
```

---

## 📈 Performance Tips

1. **Use specific product number** - Reduces data returned
2. **Select appropriate period** - Quarterly/yearly aggregates more efficiently
3. **Debounce search input** - Already done by hook (300ms)
4. **Memoize calculations** - Use `useMemo` for complex calculations
5. **Consider React Query** - For advanced caching (future)

---

## 🚦 Status Indicators

### Loading State
```typescript
if (loading) return <Skeleton />  // Pulse animation
```

### Error State
```typescript
if (error) return (
  <div className="error">
    Error: {error.message}
  </div>
)
```

### Success State
```typescript
return <Dashboard data={summary} />
```

---

## 📱 Response Times

| Endpoint | Typical Time | Cached |
|----------|-------------|--------|
| `/budgets/` | 200-300ms | No |
| `/budgets/summary` | 150-250ms | No |
| `/budgets/summary/trend` | 200-400ms | No |
| `/budgets/search` | 100-200ms | No |
| `/budgets/by-project/{id}` | 50-150ms | No |

---

## 🎓 Learning Path

1. **Start here:** Understand BudgetSummary data type
2. **Then:** Learn useBudgetSummaryApi hook
3. **Next:** Implement product search with useProductSearch
4. **Advanced:** Combine multiple hooks for filtered dashboard
5. **Expert:** Migrate to React Query for advanced caching

---

## 📚 Full Documentation

For detailed information, see:
- `REAL_TIME_DATA_INTEGRATION.md` - Complete architecture
- `API_CONTRACT.md` - Detailed API specifications
- `IMPLEMENTATION_GUIDE.md` - Step-by-step implementation
