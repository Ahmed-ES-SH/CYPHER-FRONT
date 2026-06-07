Add New Category — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/categories/new with a category form and useCreateCategoryMutation.

Files to create / update
- app/(dashboard)/dashboard/categories/new/page.tsx — route page
- app/_components/_dashboard/Categories/CategoryForm.tsx — presentational form

Data & Hooks
- useCreateCategoryMutation(), useCategories() (src/modules/categories/categories.hooks.ts)

Detailed Steps
1. Create CategoryForm
   - Fields: name, slug (auto-gen), parent category (select), image
   - Use useCategories() to fetch parent categories for the select

2. Create page at app/(dashboard)/dashboard/categories/new/page.tsx
   - Use DashboardLayout; render CategoryForm and call useCreateCategoryMutation.
   - On success, redirect to categories admin list and show toast.

3. Slug generation
   - Auto-generate slug from name via a small util (kebab-case) but allow manual edits with validation.

4. Tests and verification
   - Manual: create category; verify it appears in categories list.

Notes / Constraints
- Keep mutation invalidation (hooks already invalidate lists) so lists refresh after create.
