Add New Blog Post — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/blog/new with a blog editor and useCreateBlogPost/useUpdateBlogPost hooks.

Files to create / update
- app/(dashboard)/dashboard/blog/new/page.tsx — route page
- app/_components/_dashboard/Blog/BlogEditor.tsx — editor UI (client)

Data & Hooks
- useCreateBlogPost(), useUpdateBlogPost() from src/modules/blog/hooks/blog.hooks.ts

Detailed Steps
1. Create BlogEditor component
   - Fields: title, slug, excerpt, content (rich text or textarea), tags (multi-select), publish toggle
   - Lazy-load any heavy rich-text editor client libraries and set ssr: false on dynamic imports.

2. Create page at app/(dashboard)/dashboard/blog/new/page.tsx
   - Use DashboardLayout and render BlogEditor.
   - On submit, call useCreateBlogPost; on success redirect to /dashboard/blog and show toast.

3. Edit flow
   - If editing, prefetch the admin blog post by id using prefetch helpers or a route param, then call useAdminBlogPost(id) in the editor.

4. Tests & Verification
   - Manual: create and edit posts; verify listing updates.
   - Add unit tests for the editor submission handler and the hook integration.

Notes / Constraints
- Keep editor client-only and lazy-loaded to avoid SSR cost.
- Use hook invalidation logic for list refreshing (already implemented in blog hooks).
