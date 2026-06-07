Notifications — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/notifications by reusing src/modules/notifications components and hooks.

Files to create / update
- app/(dashboard)/dashboard/notifications/page.tsx — route page that imports and renders AdminNotificationsPage
- app/_components/_dashboard/Notifications/ (optional folder for shared presentational components)

Data & Hooks
- useAdminNotifications(filters) — used inside AdminNotificationsPage
- useAdminDeleteNotification()

Detailed Steps
1. Create page at app/(dashboard)/dashboard/notifications/page.tsx that uses DashboardLayout and renders <AdminNotificationsPage /> from src/modules/notifications/components/AdminNotificationsPage.tsx.

2. Ensure SendNotificationForm and BroadcastNotificationForm are available and work as client components. They are imported by AdminNotificationsPage already.

3. No additional hooks required; the module already follows the correct query invalidation patterns.

4. Tests and verification
   - Manual: Visit /dashboard/notifications, verify listing, filters, sending and broadcast forms, and deletion flow.
   - Add e2e test that opens the send form and submits a sample notification (mock network or run in a test environment).

Notes / Constraints
- Reuse the module components directly to minimize work. They already implement loading, error, empty states and animations with framer-motion.
