# Job Roles & Starter Bullet Library API Contracts

**Base URL**: `/api/job-roles`  
**Authentication**: Public / Authenticated  
**Validation**: Zod Schemas (`shared/src/schemas/job-role.schema.ts`)  

---

## 1. Search & Autocomplete Job Roles
Returns real-time suggestions from the curated database catalog as the user types their target job.

- **Method**: `GET /api/job-roles?query={searchQuery}`
- **Example**: `GET /api/job-roles?query=front`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "role-1",
        "title": "Frontend Developer",
        "industryTrack": "Software Engineering",
        "templateBulletCount": 8
      },
      {
        "id": "role-2",
        "title": "Frontend Engineer - React Specialist",
        "industryTrack": "Software Engineering",
        "templateBulletCount": 6
      }
    ]
  }
  ```

---

## 2. Get Template Bullet Points for a Role
Retrieves pre-curated, high-impact achievement starter bullets categorized by skill domain for a selected role.

- **Method**: `GET /api/job-roles/:id/bullets`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "roleId": "role-1",
      "roleTitle": "Frontend Developer",
      "bulletsByCategory": {
        "UI Performance & Optimization": [
          {
            "id": "tb-1",
            "powerVerb": "Optimized",
            "bulletText": "Optimized client-side rendering and asset pipelines, cutting initial page load time by 35% across high-traffic mobile web interfaces.",
            "framework": "XYZ"
          },
          {
            "id": "tb-2",
            "powerVerb": "Refactored",
            "bulletText": "Refactored legacy component tree using React 18 Concurrent features and memoization, reducing unnecessary re-renders by 50%.",
            "framework": "XYZ"
          }
        ],
        "API Integration & State": [
          {
            "id": "tb-3",
            "powerVerb": "Architected",
            "bulletText": "Architected resilient client-side state management layer handling asynchronous REST API data synchronization with optimistic UI updates.",
            "framework": "XYZ"
          }
        ],
        "Design Systems & Accessibility": [
          {
            "id": "tb-4",
            "powerVerb": "Engineered",
            "bulletText": "Engineered reusable, accessible component design system complying with WCAG 2.1 AA standards using Tailwind CSS and TypeScript.",
            "framework": "XYZ"
          }
        ]
      }
    }
  }
  ```
