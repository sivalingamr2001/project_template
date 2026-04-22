## Plan: API Integration for new UI

TL;DR: Port the old UI API client and budget/auth feature layers into the new `client` app, fix missing provider wiring, and switch the new pages from sample/local data to real API-backed data.

Steps
1. Align dependencies and shared API client
   - Add `axios` to `client/package.json`.
   - Create `client/src/shared/lib/api-client.ts` using the old UI implementation.
   - Add `VITE_API_URL` support so new UI can target the API when running in dev or production.

2. Port auth and budget feature files from the old UI into the new client
   - Add `client/src/features/auth/api/authApi.ts` and any auth types needed.
   - Add `client/src/features/budget/types/index.ts` with budget request/response shapes and mapping helpers.
   - Keep the new UI auth/budget provider skeletons by adding missing feature code instead of rebuilding from scratch.

3. Fix provider imports and App bootstrap
   - Add `client/src/context/AuthContext.tsx` to re-export `AuthProvider` and `useAuth` if needed.
   - Fix `client/src/main.tsx` / login-related imports so the app compiles.
   - Wrap the app with `BudgetProvider` in `main.tsx` as well.

4. Replace sample data with API-backed state in new pages
   - Update `client/src/hooks/useBudgetData.ts` or add new API hooks to compute budget summary/trends from fetched budgets instead of `budgetRecord.json`.
   - Update `Dashboard`, `ReportPage`, `ProjectSearch`, and `PlanEntry` to consume API-backed data or Budget context.
   - Use server endpoints:
     - `POST /api/auth/login`
     - `GET /api/budgets`
     - `GET /api/budgets/search?productNo=...`
     - `GET /api/budgets/by-project/{productNo}`
     - `GET /api/budgets/by-project/{projectCode}/product/{productNo}`
     - `POST /api/budgets`
     - `PUT /api/budgets/{budgetId}`
     - `DELETE /api/budgets/{budgetId}`
     - `POST /api/budgets/actual-amounts`

5. Handle auth response and server contract differences
   - Align `auth-provider.tsx` with server `LoginResponse` shape (session.user).
   - Remove or disable signup/register support until the server exposes `/api/auth/register`.
   - Keep protected-route behavior and local storage login persistence.

6. Validate and test
   - Run `npm install` and `npm run typecheck` in `client`.
   - Run the server and new UI and verify login, budgets listing, project search, plan entry save, and report page behavior.
   - Confirm that `BudgetProvider` and `AuthProvider` are both active and no missing import/alias errors remain.

Relevant files
- `client/package.json`
- `client/src/shared/lib/api-client.ts` (new)
- `client/src/features/auth/api/authApi.ts` (new)
- `client/src/features/budget/types/index.ts` (new)
- `client/src/context/auth-provider.tsx`
- `client/src/context/AuthContext.tsx` (new)
- `client/src/context/Budget/BudgetProvider.tsx`
- `client/src/context/Budget/BudgetContext.tsx`
- `client/src/main.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/components/login-form.tsx`
- `client/src/routes/ProtectedRoute.tsx`
- `client/src/hooks/useBudgetData.ts`
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/ReportPage.tsx`
- `client/src/pages/ProjectSearch.tsx`
- `client/src/pages/PlanEntry.tsx`

Verification
1. Build and typecheck the `client` app after wiring the new API layer.
2. Run the server and client together, then test:
   - login flow and protected route redirect
   - budget list fetch from `/api/budgets`
   - project search via the budget search endpoints
   - plan entry save/update calls to `/api/budgets`
   - report page summaries and trend charts built from live budget data.
3. Confirm no broken imports for missing auth/budget feature files.

Decisions
- The new UI will use the old UI API client implementation as the canonical integration pattern.
- Because the server currently exposes only login, not register, signup should be deferred or disabled.
- Budget API integration will target the server routes already defined in `Server/Features/BudgetRecords`.

Further considerations
1. If you want user registration now, we need a separate server endpoint for `/api/auth/register`.
2. If the client will run on a separate origin from the server, ensure `VITE_API_URL` is configured and CORS stays enabled.
