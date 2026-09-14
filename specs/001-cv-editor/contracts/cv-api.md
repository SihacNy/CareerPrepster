# CV Management API Contracts

**Base URL**: `/api/cvs`  
**Authentication**: Session Cookie (`HttpOnly`) / Bearer Token  
**Validation**: Zod Schemas (`shared/src/schemas/cv.schema.ts`)  
**Architecture (Alternative 3)**: Normalized Relational Tables (`cvs`, `cv_sections`, `cv_items`, `bullet_points`, `skill_groups`) with matching generic frontend store state.

---

## 1. List User's CVs (Dashboard / History)
Retrieves summary metadata for all CVs owned by the authenticated user.

- **Method**: `GET /api/cvs`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c7a8b9c0-1234-5678-90ab-cdef12345678",
        "title": "Data Scientist Resume",
        "templateId": "classic-ats",
        "targetRoleId": "role-uuid-123",
        "fullName": "Alex Rivera",
        "atsScore": 88,
        "createdAt": "2026-09-11T12:00:00.000Z",
        "updatedAt": "2026-09-14T10:30:00.000Z"
      }
    ]
  }
  ```

---

## 2. Create Full CV Document
Creates a new relational CV document with nested sections, items, bullet points, and skill groups in one transaction.

- **Method**: `POST /api/cvs`
- **Request Body (Zod: `CreateCVSchema`)**:
  ```json
  {
    "title": "Data Scientist Resume",
    "templateId": "classic-ats",
    "fullName": "Alex Rivera",
    "email": "alex.rivera@university.edu",
    "phone": "+1 (555) 432-8901",
    "location": "Seattle, WA",
    "summary": "Final-year Computer Science student specializing in predictive ML modeling.",
    "sections": [
      {
        "sectionType": "EXPERIENCE",
        "orderIndex": 0,
        "items": [
          {
            "title": "Data Science Intern",
            "subtitle": "TechNova Solutions",
            "location": "Seattle, WA",
            "startDate": "Jun 2025",
            "endDate": "Aug 2025",
            "isCurrent": false,
            "bulletPoints": [
              {
                "text": "Engineered predictive customer lifetime value models using XGBoost, lifting conversion by 23%.",
                "framework": "XYZ"
              }
            ]
          }
        ]
      },
      {
        "sectionType": "EDUCATION",
        "orderIndex": 1,
        "items": [
          {
            "title": "B.S. in Computer Science",
            "subtitle": "University of Washington",
            "startDate": "Sep 2022",
            "endDate": "Jun 2026",
            "isCurrent": true,
            "bulletPoints": [
              {
                "text": "Dean's List all quarters; Undergraduate Algorithms Teaching Assistant."
              }
            ]
          }
        ]
      }
    ],
    "skillGroups": [
      {
        "categoryName": "Programming & AI",
        "skills": ["Python", "SQL", "Scikit-Learn", "PyTorch", "Docker"]
      }
    ]
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c7a8b9c0-1234-5678-90ab-cdef12345678",
      "userId": "user-uuid-123",
      "title": "Data Scientist Resume",
      "templateId": "classic-ats",
      "createdAt": "2026-09-11T12:00:00.000Z",
      "updatedAt": "2026-09-11T12:00:00.000Z"
    }
  }
  ```

---

## 3. Get Full CV Document
Retrieves the complete CV tree (sections, items, bullet points, and skill groups) in order.

- **Method**: `GET /api/cvs/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c7a8b9c0-1234-5678-90ab-cdef12345678",
      "title": "Data Scientist Resume",
      "templateId": "classic-ats",
      "fullName": "Alex Rivera",
      "email": "alex.rivera@university.edu",
      "phone": "+1 (555) 432-8901",
      "location": "Seattle, WA",
      "linkedinUrl": "https://linkedin.com/in/alexrivera",
      "githubUrl": "https://github.com/alexrivera",
      "summary": "Final-year Computer Science student specializing in predictive ML modeling.",
      "sections": [
        {
          "id": "sec-1",
          "sectionType": "EXPERIENCE",
          "orderIndex": 0,
          "items": [
            {
              "id": "item-1",
              "title": "Data Science Intern",
              "subtitle": "TechNova Solutions",
              "location": "Seattle, WA",
              "startDate": "Jun 2025",
              "endDate": "Aug 2025",
              "isCurrent": false,
              "bulletPoints": [
                {
                  "id": "bp-1",
                  "text": "Engineered predictive customer lifetime value models using XGBoost, lifting conversion by 23%.",
                  "framework": "XYZ",
                  "actionVerb": "Engineered",
                  "hasMetric": true
                }
              ]
            }
          ]
        },
        {
          "id": "sec-2",
          "sectionType": "EDUCATION",
          "orderIndex": 1,
          "items": [
            {
              "id": "item-2",
              "title": "B.S. in Computer Science",
              "subtitle": "University of Washington",
              "startDate": "Sep 2022",
              "endDate": "Jun 2026",
              "isCurrent": true,
              "bulletPoints": [
                {
                  "id": "bp-2",
                  "text": "Dean's List all quarters; Undergraduate Algorithms Teaching Assistant."
                }
              ]
            }
          ]
        }
      ],
      "skillGroups": [
        {
          "id": "sg-1",
          "categoryName": "Programming & AI",
          "skills": ["Python", "SQL", "Scikit-Learn", "PyTorch", "Docker"]
        }
      ],
      "updatedAt": "2026-09-14T10:30:00.000Z"
    }
  }
  ```

---

## 4. Update Full CV Document
Updates CV header and syncs all sections, items, bullet points, and skill groups atomically.

- **Method**: `PUT /api/cvs/:id`
- **Request Body (Zod: `UpdateCVSchema`)**:
  Full structured CV payload matching the `POST /api/cvs` schema.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c7a8b9c0-1234-5678-90ab-cdef12345678",
      "updatedAt": "2026-09-14T10:35:00.000Z"
    }
  }
  ```

---

## 5. Delete CV Document
Deletes CV and cascades deletion across all associated `cv_sections`, `cv_items`, `bullet_points`, and `skill_groups`.

- **Method**: `DELETE /api/cvs/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "CV deleted successfully"
  }
  ```
