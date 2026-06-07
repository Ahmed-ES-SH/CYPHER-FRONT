Admin Products Dashboard

Purpose
- Implement the admin products screen using design from screens/dashboard/cypher_admin_products_dashboard.

Route
- /dashboard/products

UI Summary
- Header, create product button
- Products table with publish toggle, edit, delete
- Pagination and filters

Integration Points
- src/modules/products/api/products.api (APIs)
- src/modules/products/hooks (admin hooks if present), otherwise create hooks mirroring patterns in categories and users.

Implementation Plan
1. Create page at app/(dashboard)/dashboard/products/page.tsx using DashboardLayout.
2. Implement useAdminProducts hook (if missing) using getAdminProductsApi and productKeys; place hooks under src/modules/products/hooks.
3. Use create/update/delete hooks analogous to categories and blog hooks with proper query invalidation.
4. Render table with controls: publish toggle (toggleProductPublishApi), edit navigates to edit page or modal, delete uses deleteProductApi.
5. Support loading, error, and empty states.

Notes
- Prefer minimal changes: if admin hooks already exist, import them. Otherwise create localized hooks following project conventions.
