Add New Category

Purpose
- Implement create category screen from screens/dashboard/cypher_add_new_category.

Route
- /dashboard/categories/new

UI Summary
- Form: name, slug, parent category, image

Integration Points
- src/modules/categories/hooks: useCreateCategoryMutation, useCategories

Implementation Plan
1. Create page at app/(dashboard)/dashboard/categories/new/page.tsx using DashboardLayout.
2. Use CategoryForm component and useCreateCategoryMutation hook. On success navigate to categories list.
3. Use useCategories to populate parent category select.

Notes
- Ensure slug is auto-generated from name and validated.
