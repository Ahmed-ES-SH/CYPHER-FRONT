Admin Payments Dashboard

Purpose
- Implement payments admin screen from screens/dashboard/cypher_admin_payment_dashboard.

Route
- /dashboard/payments

UI Summary
- Header, filters (status, date range), transactions list, transaction detail preview

Integration Points
- src/modules/payments/hooks/useAdminPaymentHistory, useAdminPaymentTransaction

Implementation Plan
1. Create page at app/(dashboard)/dashboard/payments/page.tsx using DashboardLayout.
2. Use useAdminPaymentHistory to fetch the transactions list with pagination and filters.
3. Clicking a transaction opens a detail panel using useAdminPaymentTransaction(id) to fetch details.
4. Support loading, error, and empty states; add lightweight CSV export (optional) by calling payments.api.

Notes
- Ensure payment lists are invalidated or refetched after refunds or status changes. Use hooks in src/modules/payments that already handle invalidation.
