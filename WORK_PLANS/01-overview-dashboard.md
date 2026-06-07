Overview Dashboard — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Build /dashboard/overview route using a shared DashboardLayout and the existing user stats hooks.

Files to create
- app/(dashboard)/dashboard/layout.tsx (if not created yet) — shared layout with Sidebar and header
- app/_components/_dashboard/Sidebar.tsx — reusable Sidebar component (mobile variant exists; adapt from MobileSidebar)
- app/(dashboard)/dashboard/overview/page.tsx — page entry
- app/_components/_dashboard/Overview/KPIs.tsx — KPI cards (presentational)
- app/_components/_dashboard/Overview/ChartsSection.tsx — lazy-loaded charts wrapper

Data & Hooks
- useUserStats (src/modules/user/hooks/useUser.hook.ts) — fetch KPIs
- prefetch helpers (if server prefetching is desired) — use QueryClient prefetch functions already present in modules

Detailed Steps
1. Ensure DashboardLayout exists. If not, create app/(dashboard)/dashboard/layout.tsx which:
   - Imports the Sidebar component and renders it once on the left.
   - Provides a header area above children with a page title slot.
   - Renders children in a scrollable main container with padding max-w-7xl.
   - Use server components where possible for layout; Sidebar can be a client component if it uses hooks like useAuth.

2. Create Sidebar component: app/_components/_dashboard/Sidebar.tsx
   - Reuse nav items from MobileSidebar and UserButton (app/_components/_website/_navbar). Keep route paths matching the pages (overview, users, products, payments, blog, notifications).
   - Show current user's name/email using useAuth() from src/modules/auth.
   - Make Sidebar responsive: collapsible on mobile; reuse existing project classes.

3. Build Overview KPIs component
   - app/_components/_dashboard/Overview/KPIs.tsx
   - Accepts stats prop matching useUserStats return type (or make inside hook call client-side).
   - Render cards using Tailwind and colors from DESIGN.md.

4. Build ChartsSection as client-only and lazy-loaded
   - app/_components/_dashboard/Overview/ChartsSection.tsx
   - Use dynamic(import) with ssr: false where imported in page.
   - Keep placeholder loading state (pulse card) similar to AdminDashboardPage.

5. Create page at app/(dashboard)/dashboard/overview/page.tsx
   - This page uses DashboardLayout (child route) and renders header, KPIs, lazy ChartsSection, recent activity list (users/orders) using light placeholders.
   - For data, call useUserStats client-side and pass to KPIs; optionally prefetch on server via QueryClient in a server component wrapper.

6. Tests and verification
   - Manual: Start dev server and visit /dashboard/overview. Verify sidebar appears once and children content loads; charts are lazy-loaded and KPIs show data.
   - Add a smoke test file (tests/e2e/dashboard/overview.spec.ts) optionally to verify presence of main sections.

Notes / Constraints
- Keep logic inside hooks and services. Do not call APIs directly from components.
- Keep ChartsSection memoized and lazy to reduce SSR cost.
- Use Tailwind utilities following DESIGN.md tokens; add classnames that match project pattern (max-w-7xl container, rounded-xl, bg-surface-elevated, etc.).
