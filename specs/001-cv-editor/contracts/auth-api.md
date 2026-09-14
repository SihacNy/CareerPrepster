# Authentication API Contracts (OAuth 2.0)

**Base URL**: `/api/auth`  
**Providers Supported**: Google OAuth 2.0, GitHub OAuth  
**Token Storage**: `HttpOnly, Secure, SameSite=Lax` Cookie (`token`)  
**Credentials Policy**: No passwords stored; identity verified via OAuth provider tokens  

---

## 1. Google OAuth Initiation
Redirects the user to Google's OAuth 2.0 consent screen.

- **Method**: `GET /api/auth/google`
- **Response `302 Found`**: Redirects to `https://accounts.google.com/o/oauth2/v2/auth` with `client_id`, `redirect_uri`, and scopes `['profile', 'email']`.

---

## 2. Google OAuth Callback & Token Exchange
Handles authentication either via server redirect callback or direct client-side token verification (from `@react-oauth/google`).

### Flow A: Redirect Callback
- **Method**: `GET /api/auth/google/callback?code={authCode}`
- **Response `302 Found`**:
  - **Header**: `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  - **Redirect**: Redirects to `http://localhost:3000/editor` (or stored `returnTo` state)

### Flow B: Direct Client ID Token Exchange
- **Method**: `POST /api/auth/google`
- **Body**:
  ```json
  { "idToken": "<google_credential_or_id_token>" }
  ```
- **Response `200 OK`**:
  - **Header**: `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  - **Body**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "u-123e4567-e89b-12d3-a456-426614174000",
          "email": "alex.smith@university.edu",
          "name": "Alex Smith",
          "avatarUrl": "https://lh3.googleusercontent.com/a/...",
          "provider": "google"
        }
      }
    }
    ```

---

## 3. GitHub OAuth Initiation & Callback
Alternative 1-click login for tech students.

- **Method**: `GET /api/auth/github`
  - Redirects to GitHub OAuth consent screen.
- **Method**: `GET /api/auth/github/callback?code={authCode}`
  - Exchanges code, upserts user, sets `token` cookie, and redirects to frontend.

---

## 4. Get Current User (`Me`)
Validates the `HttpOnly` cookie and returns active profile details.

- **Method**: `GET /api/auth/me`
- **Headers**: Automatically includes browser cookie
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "u-123e4567-e89b-12d3-a456-426614174000",
        "email": "alex.smith@university.edu",
        "name": "Alex Smith",
        "avatarUrl": "https://lh3.googleusercontent.com/a/...",
        "provider": "google"
      }
    }
  }
  ```
- **Response `401 Unauthorized`**: Cookie missing or expired.

---

## 5. Logout
Clears the session cookie.

- **Method**: `POST /api/auth/logout`
- **Response `200 OK`**:
  - **Header**: `Set-Cookie: token=; HttpOnly; Secure; Path=/; Max-Age=0`
  - **Body**:
    ```json
    { "success": true, "message": "Logged out successfully" }
    ```
