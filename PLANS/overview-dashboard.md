Overview Dashboard

Purpose
- Implement the admin overview dashboard screen located under screens/dashboard/cypher_admin_overview_dashboard.

Route
- /dashboard/overview (nested under /(dashboard)/dashboard layout)

UI Summary (from design)
- Top header: title + subtitle
- Quick KPI cards (revenue, users, sessions, conversion)
- Charts section (lazy-loaded)
- Recent activity / lists (users, orders)

Integration Points
- Use src/modules/user/hooks/useUserStats and AdminDashboardPage components as reference for KPIs and charts.
- For charts, reuse existing ChartsSection (dynamic import pattern used in AdminDashboardPage).

Implementation Plan
1. Create a server/client page component at app/(dashboard)/dashboard/overview/page.tsx that uses the shared DashboardLayout (see layout plan) and renders the Overview screen.
2. Extract or reuse KPIs and QuickActions from src/modules/user/components/pages/AdminDashboardPage (copy small presentational pieces or import them if moving to app/_components).
3. Lazy-load Charts with dynamic import and keep SSR disabled for heavy chart libs.
4. Fetch admin stats via useUserStats (client) or via prefetch helpers on server and pass data to client components.
5. use static data for now to display the screen UI
6. Support loading and error states.

Notes
- Use Tailwind utility classes consistent with project.
