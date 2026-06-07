Admin Payments — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/payments with transaction list, filters, and a detail preview panel.

Files to create / update
- app/(dashboard)/dashboard/payments/page.tsx — route page
- app/_components/_dashboard/Payments/PaymentsTable.tsx — presentational table
- app/_components/_dashboard/Payments/PaymentDetailPanel.tsx — detail panel that fetches via useAdminPaymentTransaction

Data & Hooks
- useAdminPaymentHistory(params)
- useAdminPaymentTransaction(id)
- payments.api functions for export (getAdminPaymentHistoryApi)

Detailed Steps
1. Create page at app/(dashboard)/dashboard/payments/page.tsx using DashboardLayout.
   - Render header and filters (status, date range). Keep filters as local state and include in query params if desired.
   - Use useAdminPaymentHistory(filters) to fetch the transaction list.

2. Create PaymentsTable that accepts transactions and onSelect callback.
   - Render table rows with amount, status, user, date, and actions (refund if permitted).

3. Create PaymentDetailPanel
   - When a row is selected, open a side panel or modal and fetch details via useAdminPaymentTransaction(id).
   - Show detailed fields (payment method, items, billing, timeline). Support actions like Refund if the payments module exposes such mutations.

4. CSV Export (optional)
   - Implement a simple export button that calls getAdminPaymentHistoryApi with current filters and converts results to CSV client-side.

5. Tests and verification
   - Manual: Verify list loads, selecting a transaction opens the detail panel and details load correctly.
   - Add unit tests for hooks and e2e scenario for admin payments page.

Notes / Constraints
- Payments hooks already define staleTime and gcTime; ensure UI invalidates or refetches when refund or status-change mutations succeed.
- Keep sensitive actions (refunds) gated and confirm via modal.
