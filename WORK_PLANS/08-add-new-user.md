Add New User — Work Plan

NOTE: Read DESIGN.md before starting any UI work. Follow typography, spacing, colors, and component rules there.

Goal
- Implement /dashboard/users/new with user creation form using useRegister.

Files to create / update
- app/(dashboard)/dashboard/users/new/page.tsx — route page
- app/_components/_dashboard/User/UserForm.tsx — presentational form

Data & Hooks
- useRegister() from src/modules/user/hooks/useUser.hook.ts

Detailed Steps
1. Create UserForm component
   - Fields: name, email, password, role (select), status (active/disabled)
   - Validate fields client-side (email format, password length) before calling mutation.

2. Create page at app/(dashboard)/dashboard/users/new/page.tsx
   - Use DashboardLayout
   - Use useRegister() mutation; on success redirect to /dashboard/users and show success toast.

3. Tests and verification
   - Manual: create a user and ensure they appear in the users list.
   - Add unit test to ensure mutation is called with normalized payload.

Notes / Constraints
- The register API may send back structured error validation; show them on fields.
- Keep UX consistent with other admin form patterns.
