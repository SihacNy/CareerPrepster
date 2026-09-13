# API Contract: Job Role Catalog & Starter Bullet Library

**Base URL**: `/api/job-roles`

---

## 1. Search & List Job Roles

Returns active career roles matching a search query or industry filter.

- **Method**: `GET`
- **Path**: `/api/job-roles`
- **Auth Required**: No
- **Query Parameters**:
  - `q` (optional, string): Search query for title (e.g. `?q=frontend`).
  - `industry` (optional, string): Filter by industry (e.g. `?industry=Software Engineering`).

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-frontend-role",
      "title": "Frontend Developer",
      "industry": "Software Engineering",
      "description": "Builds responsive, high-performance web applications using modern JavaScript frameworks.",
      "skills": ["TypeScript", "React", "Next.js", "CSS/Tailwind", "REST APIs", "Jest"]
    },
    {
      "id": "uuid-fullstack-role",
      "title": "Full Stack Engineer",
      "industry": "Software Engineering",
      "description": "Develops end-to-end web applications across client interfaces and server APIs.",
      "skills": ["TypeScript", "Node.js", "Express", "React", "PostgreSQL", "Docker"]
    }
  ]
}
```

---

## 2. Get Role Starter Bullet Points

Returns pre-authored, high-impact STAR/XYZ bullet templates for a specific job role.

- **Method**: `GET`
- **Path**: `/api/job-roles/:id/bullets`
- **Auth Required**: No
- **Query Parameters**:
  - `category` (optional, string): Filter by skill category (e.g., `?category=Architecture & Performance`).

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-bullet-1",
      "jobRoleId": "uuid-frontend-role",
      "bulletText": "Engineered a responsive single-page dashboard using Next.js and TypeScript, reducing initial load latency by 40% for over 15,000 monthly active users.",
      "powerVerb": "Engineered",
      "skillCategory": "Architecture & Performance",
      "framework": "XYZ"
    },
    {
      "id": "uuid-bullet-2",
      "jobRoleId": "uuid-frontend-role",
      "bulletText": "Refactored legacy UI components into reusable React design system tokens, accelerating feature release cycles by 25%.",
      "powerVerb": "Refactored",
      "skillCategory": "Component Design & Refactoring",
      "framework": "XYZ"
    }
  ]
}
```
