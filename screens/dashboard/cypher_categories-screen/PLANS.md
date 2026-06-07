Categories Dashboard

Purpose
- Implement the admin categories management screen for the dashboard using the cypher_categories-screen design tokens and layout guidance.

Route
- /dashboard/categories

UI Summary
- Header with title and short subtitle explaining the list and quick actions
- Quick actions: Add Category, Import, Export (small), and a compact search input
- KPI cards: Total categories, Active categories, Categories with products, Avg products / category
- Filters: search, status (active/inactive), parent category, product count range, sort
- Category list table: thumbnail, name, slug, parent, products count, status, actions (Edit, Delete)
- Edit / Create Category modal: name, slug (auto-generate + editable), parent selector, image uploader, description, save/cancel
- Pagination and compact page-size selector

Integration Points
- Hooks: src/modules/category/hooks/useCategories, useCategoryStats, useDeleteCategory, useCreateCategory, useUpdateCategory, useCategoryFilters
- Presentational components (prefer import from the category module): CategoryListTable, CategoryStatsCards, CategoryFilters, EditCategoryModal, CategoryImageUploader
- Move small presentational pieces to app/_components/_dashboard if multiple routes will reuse them; otherwise import directly from src/modules/category/components/ui

Implementation Plan
1. Create the route at app/(dashboard)/dashboard/categories/page.tsx and wrap it with DashboardLayout.
2. Use useCategoryFilters() to read/update URL query filters (page, search, parent, status, sort).
3. Compose a filters object and call useCategories(filters) to fetch data. Show skeletons while loading.
4. Render KPI cards using useCategoryStats(). Keep KPIs lightweight—no heavy charts.
5. Render CategoryFilters wired to updateFilter(); ensure mobile filters collapse to a drawer per DESIGN.md responsive rules.
6. Render CategoryListTable with data and wire onEdit to open EditCategoryModal and onDelete to use useDeleteCategory() with a confirmation dialog.
7. Edit/Create modal should use useCreateCategory / useUpdateCategory and invalidate the categories query on success.
8. Include image uploader in the modal; use optimized thumbnails and alt text for accessibility.
9. Implement pagination controls using returned meta and updateFilter('page', val).

Notes
- Keep presentational components memoized to avoid re-renders when filters change.
- Follow the repository flow: Component → Hook → Service → API.
- Follow DESIGN.md tokens: spacing, rounded.md, font tokens, and the 90-10 color rule (mostly neutral surface with blue accents).
