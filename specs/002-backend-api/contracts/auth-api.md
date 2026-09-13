# API Contract: Authentication

**Base URL**: `/api/auth`

---

## 1. Register User

Creates a new user account and sets an HttpOnly session cookie.

- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth Required**: No

### Request Body
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Doe"
}
```

### Zod Validation Schema
```typescript
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required").max(100).optional(),
});
```

### Success Response (`201 Created`)
**Set-Cookie**: `token=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4-string",
    "email": "student@example.com",
    "name": "Jane Doe"
  }
}
```

### Error Responses
- `400 Bad Request`: Validation failure (short password, invalid email format).
- `409 Conflict`: Email is already registered (`{ "success": false, "error": { "code": "EMAIL_ALREADY_EXISTS", "message": "Email is already in use" } }`).

---

## 2. Login User

Authenticates credentials and sets an HttpOnly session cookie.

- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth Required**: No

### Request Body
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

### Success Response (`200 OK`)
**Set-Cookie**: `token=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4-string",
    "email": "student@example.com",
    "name": "Jane Doe"
  }
}
```

### Error Responses
- `401 Unauthorized`: Invalid credentials (`{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password" } }`).

---

## 3. Current User Profile

Retrieves the authenticated user's profile from the JWT session cookie.

- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth Required**: Yes (`requireAuth` middleware)

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4-string",
    "email": "student@example.com",
    "name": "Jane Doe"
  }
}
```

### Error Responses
- `401 Unauthorized`: Missing or invalid session cookie.

---

## 4. Logout User

Clears the session cookie.

- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Auth Required**: No

### Success Response (`200 OK`)
**Set-Cookie**: `token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```
