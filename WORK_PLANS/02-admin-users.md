Admin Users — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/users with full list, filters, KPIs, edit modal, and pagination using the existing user module hooks and components.

Files to create / update
- app/(dashboard)/dashboard/users/page.tsx — route page
- app/_components/_dashboard/User/UserListWrapper.tsx — page-level wrapper composing filters, KPIs and table (optional)
- (optional) Move presentational components from src/modules/user/components/ui to app/_components/_dashboard if cross-page reuse is needed: UserListTable, UserStatsCards, UserFilters, EditUserModal

Data & Hooks
- useUsers(filters)
- useUserStats()
- useDeleteUser(), useUpdateUser(id)
- useUserFilters() — manages URL query filters

Detailed Steps
1. Ensure DashboardLayout exists and is used by the route.

2. Create page at app/(dashboard)/dashboard/users/page.tsx
   - Import and use useUserFilters() to obtain page, search, role, status.
   - Build a filters object and pass to useUsers(filters).
   - Render header with title and subtitle.
   - Render KPI cards using useUserStats() data.
   - Render UserFilters component; wire onChange to updateFilter() from useUserFilters.
   - Render UserListTable with usersData.data and pass handlers onEdit and onDelete.
   - When editing, open EditUserModal; call useUpdateUser(editingUser.id) to update and allow modal to close on success; hook already invalidates queries.

3. Move / Reuse components
   - If UserListTable/UserFilters/UserStatsCards are in src/modules/user/components/ui (they are), prefer importing them directly; only move to app/_components if multiple routes require them.
   - Ensure components are "use client" when they depend on hooks or client interactions.

4. Pagination
   - Use usersData.meta or returned pagination to render Previous/Next controls and wire updateFilter('page', val)

5. Error and loading states
   - Use skeletons or spinners during loading; show an error panel with retry on error.

6. Tests
   - Unit tests: render page with mocked useUsers and useUserStats (if project has a test harness).
   - E2E: tests/e2e/auth/dashboard-users.spec.ts to ensure an admin can see user rows and open edit modal.

Notes / Constraints
- Keep presentational components memoized to avoid re-renders on filter changes.
- Follow the project flow: Component → Hook → Service → API.
- Avoid server-side rendering heavy components like tables bound to live filters; use client components for interactive features.
