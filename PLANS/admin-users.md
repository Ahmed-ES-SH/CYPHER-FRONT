Admin Users Dashboard

Purpose
- Implement the admin users management screen from screens/dashboard/cypher_admin_user_dashboard.

Route
- /dashboard/users

UI Summary
- Header with title and subtitle
- Quick actions (Add user, Send notification)
- KPI cards, filters, user list table, pagination
- Edit user modal

Integration Points
- src/modules/user/hooks/useUsers, useUserStats, useDeleteUser, useUserFilters
- Reuse UserListTable, UserStatsCards, UserFilters and EditUserModal from src/modules/user/components/pages/AdminDashboardPage. Move presentational components to app/_components/_dashboard or import directly.

Implementation Plan
1. Create page at app/(dashboard)/dashboard/users/page.tsx using DashboardLayout.
2. Use useUserFilters to manage URL-based filters; wire to UI components.
3. Use useUsers(filters) to fetch list; show skeleton or spinner while loading.
4. Use useDeleteUser mutation with optimistic UI or confirmation dialog.
5. Render EditUserModal when editing; call useUpdateUser hook for mutations.
6. Keep heavy charts out of this page; only KPIs & list.

Notes
- Keep presentational components reusable and memoized to avoid re-renders on filter changes.
- Follow AGENTS.md: Component → Hook → Service → API.
