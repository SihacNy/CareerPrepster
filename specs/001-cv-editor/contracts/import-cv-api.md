# Resume Import API Contract

**Base URL**: `/api/cvs`  
**Endpoint**: `POST /api/cvs/import`  
**Content-Type**: `multipart/form-data`  
**Validation**: File size <= 5MB, Mime-types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`  

---

## Purpose
Parses an uploaded existing resume (PDF or DOCX), extracts text layers, uses Gemini structured output parsing to categorize information into standardized CV sections (Personal Info, Education, Experience, Projects, Skills), and returns the pre-populated JSON payload ready for template selection and editor loading.

---

## Request

- **Method**: `POST /api/cvs/import`
- **Headers**:
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <token>`
- **Body**:
  - `file`: Binary file (PDF or DOCX, max 5MB)

---

## Response

- **Status**: `200 OK`
- **Body (`ImportResumeOutputSchema`)**:
  ```json
  {
    "success": true,
    "data": {
      "isImported": true,
      "sourceFileName": "Alex_Smith_Resume.pdf",
      "extractedData": {
        "fullName": "Alex Smith",
        "email": "alex.smith@university.edu",
        "phone": "+1 (555) 234-5678",
        "location": "Seattle, WA",
        "linkedinUrl": "https://linkedin.com/in/alexsmith",
        "githubUrl": "https://github.com/alexsmith",
        "summary": "Senior CS student with experience building full-stack web applications and microservices.",
        "sections": [
          {
            "sectionType": "EDUCATION",
            "title": "Education",
            "orderIndex": 0,
            "items": [
              {
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
            "sectionType": "EXPERIENCE",
            "title": "Work Experience",
            "orderIndex": 1,
            "items": [
              {
                "title": "Software Engineer Intern",
                "subtitle": "TravelTech Inc.",
                "location": "Seattle, WA",
                "startDate": "Jun 2025",
                "endDate": "Aug 2025",
                "bulletPoints": [
                  {
                    "content": "Optimized database queries by 45% and built full-stack flight booking workflows in React and Node.js.",
                    "orderIndex": 0,
                    "isAiEnhanced": false
                  }
                ]
              }
            ]
          },
          {
            "sectionType": "SKILL",
            "title": "Technical Skills",
            "orderIndex": 2,
            "skillGroups": [
              {
                "categoryName": "Languages",
                "skills": ["TypeScript", "JavaScript", "Python", "SQL"]
              },
              {
                "categoryName": "Frameworks & Tools",
                "skills": ["React", "Next.js", "Node.js", "Express", "Docker"]
              }
            ]
          }
        ]
      },
      "baselineAtsReport": {
        "overallScore": 62,
        "breakdown": {
          "parsabilityScore": 18,
          "impactScore": 16,
          "skillsScore": 15,
          "brevityScore": 13
        },
        "criticalCount": 2,
        "suggestionCount": 4,
        "passedCount": 6
      }
    }
  }
  ```

---

## Error Handling

- **`400 Bad Request` - Unsupported Format**:
  ```json
  {
    "success": false,
    "error": { "code": "INVALID_FILE_TYPE", "message": "Only PDF and DOCX files are supported." }
  }
  ```
- **`422 Unprocessable Entity` - Image-Only Scanned PDF**:
  ```json
  {
    "success": false,
    "error": { "code": "SCANNED_PDF_NO_TEXT", "message": "Could not detect selectable text in this PDF. Please upload a digital PDF or start from scratch with our templates." }
  }
  ```
- **`413 Payload Too Large`**:
  ```json
  {
    "success": false,
    "error": { "code": "FILE_TOO_LARGE", "message": "File exceeds the 5MB size limit." }
  }
  ```
