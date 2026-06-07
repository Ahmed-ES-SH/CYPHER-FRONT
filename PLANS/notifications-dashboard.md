Notifications Management

Purpose
- Implement admin notifications screen from screens/dashboard/cypher_admin_notifications.

Route
- /dashboard/notifications

UI Summary
- Header with send and broadcast buttons
- Filters, table/list of notifications, pagination

Integration Points
- src/modules/notifications/components/AdminNotificationsPage.tsx and hooks: useAdminNotifications, useAdminDeleteNotification

Implementation Plan
1. Create page at app/(dashboard)/dashboard/notifications/page.tsx using DashboardLayout and import AdminNotificationsPage component (it's presentational + hook usage already).
2. Ensure SendNotificationForm and BroadcastNotificationForm components exist and are reused.
3. Keep state (page, filters) local to the page and rely on the hooks for fetching.

Notes
- Reuse existing module components directly to minimise work; they already follow project conventions.
