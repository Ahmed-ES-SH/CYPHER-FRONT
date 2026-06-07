Dashboard Screens Implementation Plans

What I created
- Individual plan files (markdown) for each screen inside PLANS/

Overview
- Each plan follows the repository rules described in AGENTS.md: features use module hooks, UI stays presentational, routes placed under app/(dashboard)/dashboard, and a single Dashboard layout with shared Sidebar is required.

Next Steps (implementation)
1. Create a DashboardLayout at app/(dashboard)/dashboard/layout.tsx that renders the Sidebar once and the children area alongside a top header. Use parallel server data fetching for the sidebar where necessary.
2. Implement each page component under app/(dashboard)/dashboard/<route>/page.tsx and import hooks/components referenced in the plans.
3. Move or copy reusable presentational components into app/_components/_dashboard for reuse across pages.
4. Keep API/services/hooks inside src/modules and import them from pages (Component → Hook → Service → API).

If you want, I can implement the DashboardLayout and one page now (e.g., /dashboard/users) and wire the Sidebar. Choose which page to build first.
