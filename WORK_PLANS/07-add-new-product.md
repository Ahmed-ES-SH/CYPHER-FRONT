Add New Product — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/products/new product creation form and hook up createProductApi.

Files to create / update
- app/(dashboard)/dashboard/products/new/page.tsx — route page
- app/_components/_dashboard/Products/ProductForm.tsx — presentational form component
- src/modules/products/hooks/product.mutations.ts — implement useCreateProduct (if missing)

Data & Hooks
- createProductApi (src/modules/products/api/products.api.ts)
- normalizeProductPayload and payload transformers for sending correct DTOs

Detailed Steps
1. Create ProductForm component
   - Fields: title, slug (auto-generated), description (textarea or RTE), price, categories (select), inventory, images (URLs or uploader), publish toggle
   - Show inline validation errors from API (products.api formats validation errors into objects)

2. Implement useCreateProduct mutation hook under src/modules/products/hooks/product.mutations.ts if not present
   - Use useMutation and onSuccess invalidate admin lists and navigate to /dashboard/products or product detail.

3. Create page at app/(dashboard)/dashboard/products/new/page.tsx
   - Wrap ProductForm in DashboardLayout
   - On successful create, show toast and redirect to products list.

4. Image uploading
   - If the project has an upload service, call it; otherwise accept image URLs.

5. Tests and verification
   - Manual: fill form and create new product; check the product appears in the admin list.
   - Unit test: mutation hook handles API success and errors.

Notes / Constraints
- Use products.api parseValidationErrors to render field-level messages.
- Keep ProductForm a client component and keep heavy editors lazy-loaded.
