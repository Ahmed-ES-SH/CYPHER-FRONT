# Auth API Integration Guide

Base URL: `http://localhost:5000/auth`

---

## Authentication Flow

### Cookie-Based Auth (httpOnly)

All authenticated endpoints read the JWT from an **httpOnly cookie** (not `Authorization` header).

| Setting | Value |
|---------|-------|
| Cookie Name | Configurable via `AUTH_TOKEN` env var (default: `cypher_auth_token`) |
| httpOnly | `true` (inaccessible to JavaScript) |
| Secure | `true` in production, `false` in development |
| SameSite | `strict` |
| MaxAge | 5 days |
| Path | `/` |

> The cookie is set automatically by the backend on **Login** and **Google OAuth Callback**.  
> The frontend **does not** need to manually store or attach the token — the browser sends it automatically on every request.

---

### How Auth Works (for frontend devs)

1. **Login** → backend validates credentials → sets httpOnly cookie + returns JSON with user + token
2. **Google OAuth** → backend handles redirect → sets httpOnly cookie → redirects to frontend
3. **Authenticated requests** → browser automatically sends the cookie → backend extracts & validates JWT from cookie
4. **Logout** → frontend sends the token in the request body → backend blacklists it
5. **Token expiry** → 7 days (configurable via `JWT_EXPIRES_IN`) → backend returns 401

---

## Endpoints

### 1. Login

Sign in with email and password.

**POST** `/auth/login`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

#### Validation Rules
| Field | Type | Rules |
|-------|------|-------|
| email | string | Required, valid email format |
| password | string | Required |

#### Success Response — `200 OK`

Sets httpOnly cookie `cypher_auth_token` (or your `AUTH_TOKEN` value) automatically.

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "role": "user",
    "status": "active",
    "googleId": null,
    "isEmailVerified": true,
    "isPremium": false,
    "stripeCustomerId": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

> **Note:** The `password` field is excluded from the response.  
> The `access_token` is also set as an httpOnly cookie — you can ignore it in the body if you prefer cookie-only auth.

#### Error Responses

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid email or password |
| `403 Forbidden` | Email not verified (a new verification email is sent automatically) |
| `429 Too Many Requests` | Rate limited — 5 attempts per 15 minutes |

**403 — Email not verified:**
```json
{
  "message": "You need to verify your email first",
  "error": "Forbidden",
  "statusCode": 403
}
```

**400 — Invalid credentials:**
```json
{
  "message": "Invalid email or password",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### 2. Login with Google

Initiates the Google OAuth2 flow and handles the callback.

**GET** `/auth/google`

Redirects the user to Google's consent screen. No request body needed.

**GET** `/auth/google/callback`

Handled automatically by the backend after Google redirects back.

| What happens | Detail |
|-------------|--------|
| Sets cookie | httpOnly cookie with JWT |
| Redirects to | `FRONTEND_URL?refresh=1` (e.g. `http://localhost:3000?refresh=1`) |

> The `?refresh=1` query param signals the frontend to refresh its state (e.g. re-fetch current user data).

#### Flow Summary

1. Frontend links to `GET http://localhost:5000/auth/google`
2. User consents in Google
3. Google redirects to backend callback
4. Backend validates, creates/links user, sets httpOnly cookie
5. Backend redirects to `FRONTEND_URL?refresh=1`

---

### 3. Get Current User

Returns the authenticated user's JWT payload (id, email, role).

**GET** `/auth/current-user`

#### Headers
No `Authorization` header needed — cookie is sent automatically by the browser.

#### Success Response — `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user"
}
```

#### Error Response — `401 Unauthorized`

```json
{
  "message": "Authentication cookie not found",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### 4. Logout

Blacklists the current JWT token so it can no longer be used.

**POST** `/auth/logout`

#### Request Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Validation Rules
| Field | Type | Rules |
|-------|------|-------|
| token | string | Required, the JWT token |

> The token is also stored in the httpOnly cookie. For logout, extract the token value from the cookie and send it in the body. The cookie itself should be cleared by the frontend (or will expire naturally).

#### Success Response — `200 OK`

```json
{
  "message": "User logged out successfully"
}
```

#### Error Response — `401 Unauthorized`

If no valid cookie is present:

```json
{
  "message": "Authentication cookie not found",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### 5. Verify Email

Verifies a user's email address using a token sent via email.

**GET** `/auth/verify-email?token=<verification_token>`

#### Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| token | string | Verification token from email |

#### Success Response — `200 OK`

```json
{
  "message": "Email verified successfully"
}
```

#### Error Responses

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Token is missing, invalid/expired, or user already verified |

```json
{
  "message": "Invalid or expired token",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### 6. Send Password Reset Email

Sends a password reset link to the user's email.

**POST** `/auth/reset-password/send`

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Validation Rules
| Field | Type | Rules |
|-------|------|-------|
| email | string | Required, valid email format |

> For security, the response is the same regardless of whether the email exists.

#### Success Response — `200 OK`

```json
{
  "message": "If an account exists with this email, a reset link has been sent."
}
```

#### Error Response

| Status | Condition |
|--------|-----------|
| `429 Too Many Requests` | Rate limited — 3 attempts per 15 minutes |

---

### 7. Verify Reset Token

Validates the password reset token before allowing a password change.

**POST** `/auth/reset-password/verify`

#### Request Body
```json
{
  "email": "user@example.com",
  "token": "reset-token-from-email"
}
```

#### Validation Rules
| Field | Type | Rules |
|-------|------|-------|
| email | string | Required, valid email format |
| token | string | Required |

#### Success Response — `200 OK`

```json
{
  "message": "This token is valid",
  "userId": 1
}
```

#### Error Responses

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid/expired token or user not found |

---

### 8. Reset Password

Resets the user's password using a verified token.

**POST** `/auth/reset-password`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "newpassword123",
  "token": "reset-token-from-email"
}
```

#### Validation Rules
| Field | Type | Rules |
|-------|------|-------|
| email | string | Required, valid email format |
| password | string | Required, minimum 6 characters |
| token | string | Required |

> You must call `/auth/reset-password/verify` first to validate the token before resetting.

#### Success Response — `200 OK`

```json
{
  "message": "Password changed successfully"
}
```

#### Error Responses

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid token, expired token, or invalid request |
| `429 Too Many Requests` | Rate limited — 5 attempts per 60 minutes |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /auth/login` | 5 attempts | 15 minutes |
| `GET /auth/verify-email` | 5 attempts | 15 minutes |
| `POST /auth/reset-password/send` | 3 attempts | 15 minutes |
| `POST /auth/reset-password/verify` | 5 attempts | 15 minutes |
| `POST /auth/reset-password` | 5 attempts | 60 minutes |

---

## Enums

### UserRoleEnum
| Value | Description |
|-------|-------------|
| `user` | Regular user |
| `admin` | Administrator |

### StatusEnum
| Value | Description |
|-------|-------------|
| `active` | Active account |
| `inactive` | Inactive account |
| `banned` | Banned account |

---

## Environment Variables (Auth-Related)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration (e.g. `7d`, `24h`, `60m`) |
| `AUTH_TOKEN` | No | `cypher_auth_token` | Name of the httpOnly cookie |
| `FRONTEND_URL` | Yes | — | Frontend URL for CORS and OAuth redirect |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | — | Google OAuth callback URL |

---

## User Object Shape

Returned inside the `user` field of the login response:

```typescript
{
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role: "user" | "admin";
  status: "active" | "inactive" | "banned";
  googleId?: string | null;
  isEmailVerified: boolean;
  isPremium: boolean;
  stripeCustomerId?: string | null;
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

---

## Cookie Configuration

Both `POST /auth/login` and `GET /auth/google/callback` set the cookie with:

```typescript
res.cookie(cookieName, access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
  path: '/',
});
```

---

## Frontend Integration Checklist

- [ ] Login form posts to `POST /auth/login` with `{ email, password }`
- [ ] On success, browser automatically stores the httpOnly cookie — **do not** manually store `access_token` in `localStorage`
- [ ] "Login with Google" links to `http://localhost:5000/auth/google`
- [ ] After Google callback, frontend checks for `?refresh=1` query param and fetches `/auth/current-user`
- [ ] Authenticated API calls automatically include the cookie (no `Authorization` header needed)
- [ ] On 401 response, redirect to login page
- [ ] Logout sends `{ token }` to `POST /auth/logout`, then clears any client-side state and redirects to login

---

## Error Response Format

All errors follow NestJS standard format:

```json
{
  "message": "Error description",
  "error": "Error type",
  "statusCode": 400
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — validation failed or invalid input |
| 403 | Forbidden — email not verified, etc. |
| 401 | Unauthorized — missing/invalid/expired/blacklisted token |
| 429 | Too Many Requests — rate limit exceeded |
| 408 | Request Timeout — external service (email) failed |
