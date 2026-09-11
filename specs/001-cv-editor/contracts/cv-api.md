# CV Management API Contracts

**Base URL**: `/api/cvs`  
**Authentication**: Bearer Token / Session Cookie  
**Validation**: Zod Schemas (`shared/src/schemas/cv.schema.ts`)  

---

## 1. Create CV
Creates a new draft CV document.

- **Method**: `POST /api/cvs`
- **Request Body (Zod: `CreateCVSchema`)**:
  ```json
  {
    "title": "Software Engineer - Fall 2026",
    "templateId": "classic-ats",
    "targetRole": "Full-Stack Software Engineer",
    "fullName": "Alex Smith",
    "email": "alex.smith@university.edu",
    "phone": "+1 (555) 234-5678",
    "location": "Seattle, WA",
    "linkedinUrl": "https://linkedin.com/in/alexsmith",
    "githubUrl": "https://github.com/alexsmith"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c7a8b9c0-1234-5678-90ab-cdef12345678",
      "userId": "user-uuid-123",
      "title": "Software Engineer - Fall 2026",
      "templateId": "classic-ats",
      "targetRole": "Full-Stack Software Engineer",
      "fullName": "Alex Smith",
      "email": "alex.smith@university.edu",
      "sections": [],
      "createdAt": "2026-09-11T12:00:00.000Z",
      "updatedAt": "2026-09-11T12:00:00.000Z"
    }
  }
  ```

---

## 2. Get Full CV
Retrieves the complete CV with all nested sections, items, and bullet points in order.

- **Method**: `GET /api/cvs/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c7a8b9c0-1234-5678-90ab-cdef12345678",
      "title": "Software Engineer - Fall 2026",
      "templateId": "classic-ats",
      "fullName": "Alex Smith",
      "email": "alex.smith@university.edu",
      "phone": "+1 (555) 234-5678",
      "location": "Seattle, WA",
      "linkedinUrl": "https://linkedin.com/in/alexsmith",
      "githubUrl": "https://github.com/alexsmith",
      "summary": "Computer Science senior with hands-on experience in distributed systems and React web apps.",
      "sections": [
        {
          "id": "sec-1",
          "sectionType": "EDUCATION",
          "title": "Education",
          "orderIndex": 0,
          "items": [
            {
              "id": "item-1",
              "title": "B.S. in Computer Science",
              "subtitle": "University of Washington",
              "location": "Seattle, WA",
              "startDate": "Sep 2022",
              "endDate": "Jun 2026",
              "isCurrent": true,
              "bulletPoints": []
            }
          ]
        },
        {
          "id": "sec-2",
          "sectionType": "PROJECT",
          "title": "Technical Projects",
          "orderIndex": 1,
          "items": [
            {
              "id": "item-2",
              "title": "CareerPrepster AI Platform",
              "subtitle": "Next.js, Express, MySQL, Docker",
              "startDate": "Jan 2026",
              "endDate": "Present",
              "bulletPoints": [
                {
                  "id": "bp-1",
                  "content": "Architected full-stack resume preparation platform supporting 500+ active students with automated ATS checks.",
                  "orderIndex": 0,
                  "isAiEnhanced": true
                }
              ]
            }
          ]
        }
      ]
    }
  }
  ```

---

## 3. Update CV Content (Autosave / Manual Save)
Upserts full CV state including sections and bullet points.

- **Method**: `PUT /api/cvs/:id`
- **Request Body (Zod: `UpdateCVSchema`)**:
  Full structured CV payload.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": { "id": "c7a8b9c0-1234-5678-90ab-cdef12345678", "updatedAt": "2026-09-11T12:05:00.000Z" }
  }
  ```

---

## 4. Delete CV
- **Method**: `DELETE /api/cvs/:id`
- **Response `200 OK`**:
  ```json
  { "success": true, "message": "CV deleted successfully" }
  ```
