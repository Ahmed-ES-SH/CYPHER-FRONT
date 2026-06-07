Add New Product

Purpose
- Implement create product screen from screens/dashboard/cypher_add_new_product.

Route
- /dashboard/products/new

UI Summary
- Multi-field product form: title, description, price, images, category, inventory, publish toggle

Integration Points
- src/modules/products/api.createProductApi and transformers
- Create hook useCreateProduct mirroring patterns in blog and categories modules.

Implementation Plan
1. Create page at app/(dashboard)/dashboard/products/new/page.tsx using DashboardLayout and a client ProductForm component.
2. Build ProductForm presentational component under app/_components/_dashboard/products/ProductForm.tsx. Use existing product transformers for payload normalization.
3. Use useCreateProduct mutation hook; on success navigate to products list or new product detail.
4. Support image uploads (use services or cloud API present in project if available). If not present, accept image URLs field.

Notes
- Validate inputs and display field-level errors from API (products.api parses validation errors into structured format).
