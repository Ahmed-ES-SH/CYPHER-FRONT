Add New User

Purpose
- Implement create user screen from screens/dashboard/cypher_add_new_user.

Route
- /dashboard/users/new

UI Summary
- Simple form: name, email, role, password, status

Integration Points
- src/modules/user/hooks: useRegister

Implementation Plan
1. Create page at app/(dashboard)/dashboard/users/new/page.tsx using DashboardLayout.
2. Build a UserForm component that calls useRegister mutation; on success navigate back to users list and invalidate queries via hook side effects.
3. Validate fields and show mutation error messages.

Notes
- Keep UX simple and consistent with other admin forms.
