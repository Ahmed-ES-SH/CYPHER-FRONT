Categories — Work Plan

NOTE: Read DESIGN.md before starting UI work. Follow tokens for typography, spacing, colors, and component rules.

Goal
- Implement /dashboard/categories with full list, filters, KPIs, edit/create modal, image upload, and pagination using the existing category module hooks and components.

Files to create / update
- app/(dashboard)/dashboard/categories/page.tsx — route page
- app/_components/_dashboard/Category/CategoryListWrapper.tsx — optional page-level wrapper composing filters, KPIs and table
- (optional) Move presentational components from src/modules/category/components/ui to app/_components/_dashboard if cross-page reuse is needed: CategoryListTable, CategoryStatsCards, CategoryFilters, EditCategoryModal, CategoryImageUploader

Data & Hooks
- useCategories(filters)
- useCategoryStats()
- useDeleteCategory(), useUpdateCategory(id), useCreateCategory()
- useCategoryFilters() — manages URL query filters

Detailed Steps
1. Ensure DashboardLayout exists and is used by the route.

2. Create page at app/(dashboard)/dashboard/categories/page.tsx
   - Mark server vs client boundaries appropriately: the page itself can be a server component that renders header and layout; the interactive parts (filters, table, modals) should be client components.
   - Import and use useCategoryFilters() inside a client wrapper to obtain page, search, parent, status, sort, pageSize.
   - Build a filters object and pass to useCategories(filters). Use stable keys and avoid passing undefined fields.
   - Render header with title and subtitle matching the category management intent.
   - Render KPI cards using useCategoryStats() data.
   - Render CategoryFilters component; wire onChange to updateFilter() from useCategoryFilters.
   - Render CategoryListTable with usersData.data and pass handlers onEdit and onDelete.
   - When creating or editing, open EditCategoryModal; call useCreateCategory or useUpdateCategory(editingId) to mutate and close modal on success; hooks should invalidate queries.

3. Move / Reuse components
   - If CategoryListTable/CategoryFilters/CategoryStatsCards/EditCategoryModal are in src/modules/category/components/ui, prefer importing them directly; only move to app/_components/_dashboard if multiple routes require them.
   - Ensure components that depend on React hooks or client-side state contain "use client" at top.

4. Filters & Mobile behavior
   - Filters should include search, status, parent, product count range, and sort.
   - On mobile, filters should collapse into a bottom or right-side drawer; follow DESIGN.md collapsing strategy.
   - Keep chip and select treatments matching the label token styles.

5. Image uploader
   - Edit/Create modal must include an image uploader. Use an existing uploader component if available; otherwise create CategoryImageUploader with thumbnail preview, file size check, and alt text input.
   - Store images via the service used by categories (check src/modules/category/services or API endpoints). If none exist, make the modal accept a File and call the create/update API that supports multipart or returns an upload URL.

6. Pagination
   - Use categoriesData.meta or returned pagination to render Previous/Next controls and a page size selector; wire updateFilter('page', val) and updateFilter('pageSize', val).

7. Error and loading states
   - Use skeleton cards for KPI and table rows during loading.
   - Show an error panel with retry for top-level failures.
   - For row-level delete, show a confirmation dialog and use optimistic UI only if supported by the hook; otherwise show a loading state on the row while delete completes.

8. Accessibility
   - Ensure all controls have accessible labels and keyboard focus states.
   - Modal traps focus and returns focus to the invoking control on close.
   - Images include alt text; uploader validates file types and sizes with appropriate messages.

9. Tests
   - Unit tests: render page and components with mocked hooks (useCategories and useCategoryStats). Verify filter updates call updateFilter and modal open/close flows.
   - E2E: tests/e2e/auth/dashboard-categories.spec.ts to ensure an admin can see KPIs, filter categories, open create/edit modal, upload an image, and delete a category.

Notes / Constraints
- Prefer small, focused changes. Keep presentational components memoized to avoid re-renders on filter changes.
- Follow the project flow: Component → Hook → Service → API.
- Avoid server-side rendering of interactive table rows—use client components to manage live filters.
