# Admin Dashboard — Implementation Plan

## Overview

Create a new admin dashboard at `app/admin/page.tsx` that serves as a control center for user data. The dashboard has 4 sections — first 3 use dummy/mock data, section 4 uses real API endpoints from the existing user module.

---

## Data Sources

| Endpoint | Method | Response | Used In |
|---|---|---|---|
| `GET /api/user/stats` | GET | `UserStats { adminsNumber, verifiedUsersNumber, unverifiedUsersNumber }` | Section 4 (real) |
| `GET /api/user` | GET | `PaginatedUsers { data: User[], total, page, perPage, lastPage }` | Section 4 (real) |
| `PATCH /api/user/:id` | PATCH | `User` | Edit modal mutation |
| `DELETE /api/user/:id` | DELETE | `void` | Delete action |
| — | — | Dummy arrays | Sections 1–3 |

---

## Section 1 — Quick Actions Cards (dummy)

4–6 action cards in a responsive grid. Each card shows an icon, title, description, and CTA.

| Card | Icon | Route |
|---|---|---|
| Add New User | `FiUserPlus` | `/admin/users` |
| Send Notification | `FiBell` | `/admin/notifications` |
| View Orders | `FiShoppingBag` | (placeholder) |
| Generate Report | `FiBarChart2` | (placeholder) |
| Site Settings | `FiSettings` | `/admin/settings` |

**Layout:** 3×2 grid (1 col mobile, 2 col tablet, 3 col desktop).  
**States:** Static — no loading/error needed.

---

## Section 2 — KPIs Cards (dummy)

4 metric cards with dummy values and trend arrows.

| KPI | Value | Trend |
|---|---|---|
| Total Revenue | \$124,592 | ↑ +12.5% |
| Total Users | 8,430 | ↑ +8.2% |
| Active Sessions | 342 | → +0.5% |
| Conversion Rate | 3.2% | ↑ +1.2% |

**Layout:** 4-column grid (1 → 2 → 4).  
**States:** Static.

---

## Section 3 — Charts (dummy, recharts)

2×2 grid of charts using `recharts` with static dummy data arrays.

| Chart | Type | Data |
|---|---|---|
| Monthly Revenue | Area chart (gradient fill) + line overlay | 12 months |
| User Registrations | Bar chart (stacked: verified / unverified) | 12 months |
| User Role Distribution | Pie chart (Admin vs User) | Single snapshot |
| Order Status | Donut chart (Pending, Shipped, Delivered, Cancelled) | Single snapshot |

**Library:** `recharts` (installed).  
**States:** Static.

---

## Section 4 — Real Data Section (real API)

Reuses existing user module components:

- `<UserStatsCards>` — real stats from `useUserStats()`
- `<UserFilters>` — search/role/status filters
- `<UserListTable>` — real user list with edit + delete buttons
- Pagination controls (Previous / Next)

**States:** Loading (spinner), Error (retry banner), Empty (no data message), Success.

---

## Edit User Modal Logic

When clicking **Edit** on a user in the table:

1. A centered modal popup opens with a dark backdrop
2. Shows all user data, pre-filled
3. Fields:

| Field | Input Type | Editable? |
|---|---|---|
| Name | text input | Yes |
| Email | email input | Yes |
| Avatar | text input (URL string) | Yes |
| Role | select (`user` / `admin`) | Yes |
| Status | select (`active` / `inactive` / `banned`) | Yes |
| Email Verified | badge/icon display | Read-only |
| Premium | badge/icon display | Read-only |
| Created At | text display | Read-only |
| Updated At | text display | Read-only |

4. On **Save** → calls `useUpdateUser(user.id).mutateAsync(formData)` → invalidates query caches
5. On **Cancel** / click outside / Escape → modal closes
6. Loading spinner on save button during mutation

### Modal Design

- Dark backdrop (`bg-black/40 backdrop-blur-sm`)
- White centered card, `max-w-lg w-full`, `rounded-xl p-6`
- Header: title + close (X) button
- Close on backdrop click + Escape key
- framer-motion fade-in animation

---

## User Delete Logic

When clicking **Delete** on a user:
- `window.confirm()` dialog (matching existing pattern)
- On confirm → `useDeleteUser().mutateAsync(user.id)`
- Invalidates user lists + stats caches

---

## Files to Create

| File | Description |
|---|---|
| `app/admin/page.tsx` | Route shell (1 line re-export) |
| `src/modules/user/components/pages/AdminDashboardPage.tsx` | Dashboard page composition |
| `src/modules/user/components/forms/EditUserModal.tsx` | Edit user modal |

## Files to Update

| File | Change |
|---|---|
| `src/modules/user/index.ts` | Add `AdminDashboardPage` export |
| `package.json` | Added `recharts` dep |

## Files NOT Modified

- `UserListTable.tsx` — already has `onEdit` + `onDelete` props
- `UserStatsCards.tsx` — reused as-is
- `UserFilters.tsx` — reused as-is
- `AdminUsersPage.tsx` — separate page, not touched
- `UserForm.tsx` — not used; edit modal is a standalone component
- `user.types.ts` — types already sufficient
- `useUser.hook.ts` — `useUpdateUser` + `useDeleteUser` already exist
