# User Module — Refactored Frontend Work Plan (Architect Edition)

> **Role:** Senior Frontend Architect  
> **Target Stack:** Next.js 16 (App Router) · React 19 · TypeScript · React Query · TailwindCSS v4 · Axios  
> **Auth:** httpOnly Cookie Integration (via `withCredentials: true`)  
> **Created:** 2026-05-22  
> **Status:** Upgraded & Resolved (Refactored Application Architecture)

---

## Part 1: Problems in the Current User Module Architecture & Harmful Impacts

A critical review of the draft `user-module-work-plan.md` highlights several legacy structures and architectural anti-patterns that complicate maintenance and prevent clean plug-and-play reuse across different projects.

### 1. Wrong Root Location & Global Scattering
*   **Why it is bad/harmful:** The draft spreads the user feature code across `types/user.ts` (globally), `helpers/api/user.ts` (globally), `hooks/use-users.ts` (globally), and `_components/_website/_users/` (globally). 
    *   This forces developers to hunt down 5 different folders just to make a modification to user registration or profile layout.
    *   It completely ruins portability, making it impossible to copy-paste the feature into another project without manually tracking and untangling scattered files.
*   **Architectural Fix:** Confine the entire business module to `src/modules/user/`. Keep the Next.js `app/` directory pristine, reserved solely for lightweight page route shells that import and render views from this module.

### 2. Invalid HttpOnly Cookie Integration
*   **Why it is bad/harmful:** Standard authentication relies on secure `HttpOnly` cookies. Extracting JWTs client-side using `Cookies.get('token')` or storing them in local variables to inject into Axios headers violates security best practices and exposes tokens to XSS attacks. If client-side JavaScript can access the token, the auth system is compromised.
*   **Architectural Fix:** Enforce HttpOnly cookie automation. Configure the Axios client singleton `userClient` with `withCredentials: true`. The browser will naturally and securely attach HttpOnly cookies to requests on both the client side and Server-Side Rendering (SSR) pings, keeping authentication 100% secure.

### 3. Component Bloat & Page Confusion
*   **Why it is bad/harmful:** Flat component structures mix atomic UI tables (like `UserList`), dashboard summary indicators (`UserStats`), and full page layouts (`UserProfile`). Mixing atomic widgets with full-page views reduces visual reusability and raises the cognitive load of navigating visual code.
*   **Architectural Fix:** Partition visual elements under `src/modules/user/components/` into three dedicated folders:
    *   `components/ui/` — presentational elements (tables, filters, stats widgets).
    *   `components/forms/` — user input and files (registration forms, avatar upload zones).
    *   `components/pages/` — complete page/view compositions assembled for route entry points.

### 4. Over-Engineered Zustand State
*   **Why it is bad/harmful:** The draft suggests maintaining and expanding a complex user store. The user module is almost entirely server-state driven (profile detail lookups, registration states, admin table pages). Managing this in a local Zustand store introduces dual-state synchronization bugs and unnecessary code bloat.
*   **Architectural Fix:** Remove any module-level state stores. Rely entirely on **React Query (TanStack Query)** for server-state caching and async data mutations, and standard React `useState` / `useTransition` for minor component UI states (such as active filter views or edit modes). Keep global auth stores limited strictly to minimal session info (e.g. `userType`, `isAuthenticated`).

### 5. Tailwind Indirection & Visual Complexity
*   **Why it is bad/harmful:** Extracting styles into separate typescript constants files hides context and breaks IDE utility autocompletions.
*   **Architectural Fix:** Declare Tailwind CSS utility classes inline on components. This guarantees high readability, rapid styling edits, and zero styling abstractions.

---

## Part 2: Final Target & Folder Architecture

The refactored User module is self-contained under `src/modules/user/`, providing a clean, plug-and-play directory structure that can be easily dropped into any project:

```
frontend/
├── src/
│   ├── modules/
│   │   └── user/                                   ← Encapsulated Business Module
│   │       ├── api/
│   │       │   ├── user.client.ts                  # Axios client wrapper (HttpOnly ready)
│   │       │   └── user.api.ts                     # Typed HTTP endpoints
│   │       │
│   │       ├── hooks/
│   │       │   ├── useUser.hook.ts                 # React Query user hooks
│   │       │   └── useUserFilters.hook.ts          # URL query param filter sync hook
│   │       │
│   │       ├── services/
│   │       │   └── user.service.ts                 # Formatting & mapping helpers
│   │       │
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   │   ├── UserListTable.tsx           # Admin list grid
│   │       │   │   ├── UserStatsCards.tsx          # Admin statistics cards
│   │       │   │   └── UserFilters.tsx             # User filter inputs
│   │       │   │
│   │       │   ├── forms/
│   │       │   │   ├── UserForm.tsx                # Registration / profile form
│   │       │   │   └── AvatarUploader.tsx          # Drag-and-drop avatar uploader
│   │       │   │
│   │       │   └── pages/
│   │       │       ├── RegisterPage.tsx            # Signup view composition
│   │       │       ├── VerifyEmailPage.tsx         # Email verification view composition
│   │       │       ├── ProfileSettingsPage.tsx     # Profile dashboard view composition
│   │       │       └── AdminUsersPage.tsx          # Admin users management dashboard
│   │       │
│   │       ├── constants/
│   │       │   └── user.constants.ts               # React Query keys, configuration
│   │       │
│   │       ├── types/
│   │       │   └── user.types.ts                   # Core contracts & DTOs
│   │       │
│   │       └── index.ts                            # Re-export portal for routes
│   │
│   │   /* --- Clean App Router Shells --- */
├── app/
│   ├── (auth)/
│   │   └── register/
│   │       ├── page.tsx                            # Renders <RegisterPage />
│   │       └── success/
│   │           └── page.tsx                        # Static success view
│   │
│   ├── (pathes)/
│   │   ├── verify-email/
│   │   │   └── page.tsx                            # Renders <VerifyEmailPage />
│   │   └── settings/
│   │       └── profile/
│   │           └── page.tsx                        # Renders <ProfileSettingsPage />
│   │
│   └── admin/
│       ├── users/
│       │   ├── page.tsx                            # Renders <AdminUsersPage />
│       │   └── [id]/
│       │       └── page.tsx                        # Renders <ProfileSettingsPage userId={id} />
```

---

## Part 3: Separation of Responsibilities & Best Practices

To avoid over-engineering and ensure maximum reusability, the module defines clear boundaries:

### 1. App Router Entry Shells (`app/` folder)
*   **Responsibility:** Next.js routing and server parameters extraction. They receive URL properties, execute server prefetching, and render the modular page components.
*   **Rule:** Keep these files under 15 lines of code. Do not import visual Tailwind wrappers here.

### 2. Page Compositions (`components/pages/`)
*   **Responsibility:** Coordinator layouts. They orchestrate react-query hooks, set up layouts (headers, grids), and arrange `ui/` elements and `forms/`.

### 3. Forms & Uploads (`components/forms/`)
*   **Responsibility:** Manage interactive forms and validations. Form inputs (password lengths, unique name errors) are validated here, displaying clear, field-level API error messages.

### 4. API Client (`api/user.client.ts`)
*   **Responsibility:** Isolated Axios client configuration. Instantiates a dedicated endpoint wrapper.
*   **Rule:** Uses `withCredentials: true` by default. Do not write manual token headers injection.

---

## Part 4: Implementation Phases

### Phase 1 — Types & API Foundation

*   **Task 1.1: Core Types & Contracts (`types/user.types.ts`)**
    Establish shared contracts matching 1:1 with backend entities:
    ```typescript
    export enum UserRole {
      USER = "user",
      ADMIN = "admin",
    }

    export enum UserStatus {
      ACTIVE = "active",
      INACTIVE = "inactive",
      BANNED = "banned",
    }

    export interface User {
      id: number;
      email: string;
      name?: string;
      avatar?: string;
      role: UserRole;
      status: UserStatus;
      isEmailVerified: boolean;
      isPremium: boolean;
      createdAt: string;
      updatedAt: string;
    }

    export interface CreateUserDto {
      email: string;
      password: string;
      name?: string;
      avatar?: string;
    }

    export interface UpdateUserDto {
      name?: string;
      email?: string;
      avatar?: string;
      password?: string;
      role?: UserRole;
      status?: UserStatus;
    }

    export interface VerifyEmailDto {
      token: string;
    }

    export interface UserStats {
      adminsNumber: number;
      verifiedUsersNumber: number;
      unverifiedUsersNumber: number;
    }

    export interface PaginatedUsers {
      data: User[];
      total: number;
      page: number;
      perPage: number;
      lastPage: number;
    }

    export interface ApiError {
      statusCode: number;
      message: string | string[];
      errors?: Array<{ field: string; message: string }>;
    }
    ```
*   **Task 1.2: Standard Axios Client (`api/user.client.ts`)**
    Construct the HttpOnly-compatible API instance:
    ```typescript
    import axios from 'axios';

    export const userClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 12000,
      withCredentials: true, // Browser manages secure auth cookies automatically
      headers: {
        'Content-Type': 'application/json',
      },
    });
    ```
*   **Task 1.3: Endpoints Setup (`api/user.api.ts`)**
    Write raw typed Axios requests targeting endpoints:
    *   `register(dto)`: `POST /user`
    *   `verifyEmail(dto)`: `POST /user/verify-email`
    *   `listUsers(params)`: `GET /user`
    *   `getUserStats()`: `GET /user/stats`
    *   `getUserById(id)`: `GET /user/${id}`
    *   `updateUser(id, dto)`: `PATCH /user/${id}`
    *   `deleteUser(id)`: `DELETE /user/${id}`

---

### Phase 2 — React Query Hooks & Filters

*   **Task 2.1: Key Factory (`constants/user.constants.ts`)**
    ```typescript
    export const userKeys = {
      all: ['users'] as const,
      lists: () => [...userKeys.all, 'list'] as const,
      list: (filters: Record<string, any>) => [...userKeys.lists(), filters] as const,
      details: () => [...userKeys.all, 'detail'] as const,
      detail: (id: number) => [...userKeys.details(), id] as const,
      stats: () => [...userKeys.all, 'stats'] as const,
    };
    ```
*   **Task 2.2: User Query Hooks (`hooks/useUser.hook.ts`)**
    Code all queries and mutations in a single, clean hooks package:
    *   `useRegister()`: wraps `register`.
    *   `useVerifyEmail()`: wraps `verifyEmail`.
    *   `useUsers(filters)`: wraps `listUsers`. Set `staleTime` to `30000ms`.
    *   `useUserStats()`: wraps `getUserStats`. Set `staleTime` to `60000ms`.
    *   `useUser(id)`: wraps `getUserById`. Set `staleTime` to `30000ms`.
    *   `useUpdateUser(id)`: wraps `updateUser`. Invalidates list and details on success.
    *   `useDeleteUser()`: wraps `deleteUser`. Invalidates lists.
*   **Task 2.3: URL Sync Hook (`hooks/useUserFilters.hook.ts`)**
    Orchestrate state queries directly using Next.js URL SearchParams:
    ```typescript
    import { useRouter, useSearchParams } from 'next/navigation';

    export function useUserFilters() {
      const router = useRouter();
      const searchParams = useSearchParams();

      const page = Number(searchParams.get('page')) || 1;
      const search = searchParams.get('search') || '';
      const role = searchParams.get('role') || '';
      const status = searchParams.get('status') || '';

      const updateFilter = (key: string, value: any) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
        params.set('page', '1'); // Reset pagination
        router.push(`?${params.toString()}`);
      };

      return { page, search, role, status, updateFilter };
    }
    ```

---

### Phase 3 — Visual Sub-Components (UI & Forms)

*   **Task 3.1: Presentational Widgets (`components/ui/`)**
    *   `UserListTable.tsx`: Admin data list displaying names, verified badges, roles, active statuses, and edit/delete links. Keeps Tailwind classes inline.
    *   `UserStatsCards.tsx`: Displays metrics: verified vs unverified users and total admins.
    *   `UserFilters.tsx`: Incorporates debounced search input, role select dropdown, and status select filter.
*   **Task 3.2: Inputs & Forms (`components/forms/`)**
    *   `UserForm.tsx`: Reusable editor. Accepts `mode: 'register' | 'edit'` and `initialData` props. Handles validation errors returned from the API, mapping field-specific errors to inputs.
    *   `AvatarUploader.tsx`: Drag-and-drop zone that handles uploading and returns temporary avatar URLs.

---

### Phase 4 — Page Compositions & Integration Route Shells

*   **Task 4.1: View Page Assemblies (`components/pages/`)**
    *   `RegisterPage.tsx`: Coordinates registration workflow, rendering `<UserForm mode="register" />`.
    *   `VerifyEmailPage.tsx`: Resolves email tokens from URL query parameters, invokes `useVerifyEmail` in a mount effect, and renders loading, success, or validation failure pages.
    *   `ProfileSettingsPage.tsx`: Fetches details by ID (defaults to active user session). Renders `<UserForm mode="edit" />`.
    *   `AdminUsersPage.tsx`: Orchestrates admin actions, rendering filters, user tables, and statistic indicators.
*   **Task 4.2: App Router Re-export Shells**
    Integrate routing shells in the App router directory. These contain clean re-exports pointing to modular pages:

    *   **Register page (`app/(auth)/register/page.tsx`)**:
        ```typescript
        import { RegisterPage } from "@/modules/user/components/pages/RegisterPage";
        export default RegisterPage;
        ```
    *   **Verify Email page (`app/verify-email/page.tsx`)**:
        ```typescript
        import { VerifyEmailPage } from "@/modules/user/components/pages/VerifyEmailPage";
        export default VerifyEmailPage;
        ```
    *   **Profile settings page (`app/settings/profile/page.tsx`)**:
        ```typescript
        import { ProfileSettingsPage } from "@/modules/user/components/pages/ProfileSettingsPage";
        export default ProfileSettingsPage;
        ```
    *   **Admin Users management (`app/admin/users/page.tsx`)**:
        ```typescript
        import { AdminUsersPage } from "@/modules/user/components/pages/AdminUsersPage";
        export default AdminUsersPage;
        ```

---

## Part 5: Invalidation Matrix & Integration

### Caching and Invalidation Matrix
Cache behaviors are handled cleanly inside hooks:

| Mutation | Action | Target Key Invalidation |
|---|---|---|
| `register(dto)` | User signs up | None (login required) |
| `updateUser(id, dto)` | Admin or user saves details | `userKeys.lists()`, `userKeys.detail(id)` |
| `deleteUser(id)` | Admin deletes a user | `userKeys.lists()`, `userKeys.stats()` |

### Verification Checklist
*   Verify that `withCredentials: true` is configured inside the `userClient`.
*   Ensure that client-side forms do not read cookies.
*   Run tests to verify that no route files contain business/rendering logic:
    ```bash
    pnpm tsc --noEmit
    pnpm lint
    ```
