Admin Blog — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/blog list and create/edit flows using existing blog hooks.

Files to create / update
- app/(dashboard)/dashboard/blog/page.tsx — route page
- app/(dashboard)/dashboard/blog/new/page.tsx — create page (or modal)
- app/_components/_dashboard/Blog/BlogList.tsx — presentational list (optional)

Data & Hooks
- useAdminBlogPosts(filters), useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost
- prefetchAdminBlogPosts for route prefetching

Detailed Steps
1. Create the listing page app/(dashboard)/dashboard/blog/page.tsx using DashboardLayout.
   - Use useAdminBlogPosts for list and wire filters and pagination.
   - Provide Create Post button linking to /dashboard/blog/new.

2. Create new blog page app/(dashboard)/dashboard/blog/new/page.tsx
   - Render client BlogEditor component (app/_components/_dashboard/Blog/BlogEditor.tsx) which calls useCreateBlogPost.
   - Lazy-load the editor (ssr: false) if it uses heavy RTE libraries.

3. Edit flow
   - Provide an edit button that navigates to /dashboard/blog/[id]/edit or opens a modal with existing post loaded via useAdminBlogPost(id).

4. Use hooks' onSuccess invalidation logic (already implemented) so the list refreshes after changes.

5. Tests and verification
   - Manual: create, edit, and delete posts and verify list updates.
   - Add unit tests for the editor component and mutation hooks if missing.

Notes / Constraints
- Prefer using existing hooks and prefetch helpers in src/modules/blog/hooks; they already contain cache invalidation logic.
