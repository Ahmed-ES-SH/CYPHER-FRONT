Admin Products — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/products listing with publish toggles, edit/delete actions, and pagination.

Files to create / update
- app/(dashboard)/dashboard/products/page.tsx — route page
- src/modules/products/hooks/admin.hooks.ts — (only if missing) implement useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductPublish
- app/_components/_dashboard/Products/ProductTable.tsx — presentational table (optional)

Data & Hooks
- getAdminProductsApi (src/modules/products/api/products.api.ts)
- toggleProductPublishApi, createProductApi, updateProductApi, deleteProductApi

Detailed Steps
1. Verify whether admin hooks already exist in src/modules/products; if present, import them. If not, create src/modules/products/hooks/admin.hooks.ts following patterns used in blog and categories:
   - useAdminProducts(filters) -> useQuery with productKeys.adminList(filters) and getAdminProductsApi
   - useCreateProduct -> useMutation(createProductApi) and invalidate admin lists
   - useUpdateProduct -> useMutation(updateProductApi) and invalidate related queries
   - useDeleteProduct -> useMutation(deleteProductApi) and invalidate lists
   - useToggleProductPublish -> useMutation(toggleProductPublishApi) and invalidate lists

2. Create page at app/(dashboard)/dashboard/products/page.tsx
   - Use DashboardLayout
   - Implement header and Create Product button linking to /dashboard/products/new
   - Use useAdminProducts(filters) to fetch list; wire filters and pagination (page, search, category)
   - Render ProductTable with columns: image, title, price, status, actions (publish toggle, edit, delete)
   - Wire actions to respective mutation hooks with confirmations and loading states

3. Edge cases and validation
   - When toggling publish, disable the toggle until mutation resolves.
   - On delete confirm via window.confirm or a modal; show toast on success/error.

4. Tests
   - Unit test for hooks using mocked API responses.
   - E2E test for product publish toggle and delete flow.

Notes / Constraints
- Keep API error parsing in products.api (it already returns structured validation errors). Show field-level errors in forms.
- Keep presentational components under app/_components/_dashboard for reuse.
