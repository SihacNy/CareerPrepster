# API Contract: CV Document Management

**Base URL**: `/api/cvs`

All endpoints in this group require authentication via the `requireAuth` middleware.

---

## 1. List User's CVs

- **Method**: `GET`
- **Path**: `/api/cvs`
- **Auth Required**: Yes

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4-1",
      "title": "Software Engineer Resume",
      "templateId": "classic-ats",
      "fullName": "Jane Doe",
      "updatedAt": "2026-09-12T14:30:00.000Z",
      "createdAt": "2026-09-10T10:00:00.000Z"
    }
  ]
}
```

---

## 2. Create CV (Initialize with Default Sections)

- **Method**: `POST`
- **Path**: `/api/cvs`
- **Auth Required**: Yes

### Request Body
```json
{
  "title": "Frontend Engineer Resume",
  "templateId": "classic-ats",
  "targetRoleId": "uuid-frontend-role",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+855 12 345 678",
  "location": "Phnom Penh, Cambodia",
  "linkedinUrl": "https://linkedin.com/in/janedoe",
  "githubUrl": "https://github.com/janedoe"
}
```

### Success Response (`201 Created`)
Returns the complete initialized CV tree with 4 default sections (Education, Experience, Projects, Skills) and empty item arrays.

---

## 3. Get CV by ID (Full Nested Tree)

- **Method**: `GET`
- **Path**: `/api/cvs/:id`
- **Auth Required**: Yes

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "uuid-cv",
    "userId": "uuid-user",
    "title": "Frontend Engineer Resume",
    "templateId": "classic-ats",
    "targetRoleId": "uuid-frontend-role",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+855 12 345 678",
    "location": "Phnom Penh, Cambodia",
    "websiteUrl": null,
    "linkedinUrl": "https://linkedin.com/in/janedoe",
    "githubUrl": "https://github.com/janedoe",
    "summary": "Motivated software engineering graduate with hands-on experience in React, TypeScript, and REST APIs.",
    "createdAt": "2026-09-12T10:00:00.000Z",
    "updatedAt": "2026-09-12T14:30:00.000Z",
    "sections": [
      {
        "id": "uuid-sec-1",
        "sectionType": "EXPERIENCE",
        "customTitle": "Work Experience",
        "orderIndex": 0,
        "isVisible": true,
        "items": [
          {
            "id": "uuid-item-1",
            "title": "Junior Frontend Developer",
            "subtitle": "Tech Solutions Asia",
            "location": "Phnom Penh",
            "startDate": "2023-06",
            "endDate": "Present",
            "isCurrent": true,
            "url": null,
            "orderIndex": 0,
            "bulletPoints": [
              {
                "id": "uuid-bp-1",
                "text": "Engineered responsive dashboard interfaces using Next.js, reducing initial load latency by 35%.",
                "actionVerb": "Engineered",
                "hasMetric": true,
                "framework": "XYZ",
                "orderIndex": 0
              }
            ]
          }
        ]
      }
    ],
    "skillGroups": [
      {
        "id": "uuid-sg-1",
        "categoryName": "Languages & Frameworks",
        "skills": ["TypeScript", "React", "Next.js", "Tailwind CSS"],
        "orderIndex": 0
      }
    ]
  }
}
```

### Error Responses
- `403 Forbidden`: CV belongs to another user.
- `404 Not Found`: CV ID does not exist.

---

## 4. Update CV (Atomic Tree Sync via Transaction)

- **Method**: `PUT`
- **Path**: `/api/cvs/:id`
- **Auth Required**: Yes

### Request Body
Accepts the full or partial CV object including modified sections, items, bullets, and skill groups.

### Success Response (`200 OK`)
Returns the synchronized, freshly fetched CV object with updated timestamps.

---

## 5. Delete CV

- **Method**: `DELETE`
- **Path**: `/api/cvs/:id`
- **Auth Required**: Yes

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "message": "CV deleted successfully"
  }
}
```
