# API Contract: Resume Import & Parsing

**Base URL**: `/api/cvs`

---

## 1. Import Resume (PDF / DOCX File)

Uploads an existing resume, extracts raw text in-process via `pdf-parse` or `mammoth`, structures it into normalized CV JSON using Google Gemini, and returns the structured CV data ready to populate the editor.

- **Method**: `POST`
- **Path**: `/api/cvs/import`
- **Content-Type**: `multipart/form-data`
- **Auth Required**: Optional / Yes (associates with user if authenticated)

### Request Payload (Multipart Form)
- `file`: Binary file data (MIME: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Max size: 5MB.

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "extractedTextLength": 2450,
    "parsedCV": {
      "fullName": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+855 12 345 678",
      "location": "Phnom Penh, Cambodia",
      "linkedinUrl": "https://linkedin.com/in/janedoe",
      "githubUrl": "https://github.com/janedoe",
      "summary": "Software engineering graduate with experience in React and TypeScript.",
      "education": [
        {
          "institution": "Institute of Technology of Cambodia",
          "degree": "Bachelor of Science in Computer Science",
          "location": "Phnom Penh",
          "startDate": "2020-10",
          "endDate": "2024-07",
          "isCurrent": false
        }
      ],
      "experience": [
        {
          "title": "Frontend Developer Intern",
          "company": "Tech Solutions Asia",
          "location": "Phnom Penh",
          "startDate": "2023-06",
          "endDate": "2023-12",
          "isCurrent": false,
          "bullets": [
            "Developed reusable UI components using React and TypeScript.",
            "Collaborated with backend engineers to integrate REST APIs."
          ]
        }
      ],
      "projects": [],
      "skillGroups": [
        {
          "categoryName": "Languages & Frameworks",
          "skills": ["JavaScript", "TypeScript", "React", "Node.js"]
        }
      ]
    }
  }
}
```

### Error Responses
- `400 Bad Request`: Invalid file type or no file uploaded (`{ "success": false, "error": { "code": "INVALID_FILE_TYPE", "message": "Only .pdf and .docx files are supported." } }`).
- `413 Payload Too Large`: Upload exceeds 5MB limit (`{ "success": false, "error": { "code": "FILE_TOO_LARGE", "message": "File exceeds 5MB size limit." } }`).
- `422 Unprocessable Entity`: Scanned image PDF without selectable text (`{ "success": false, "error": { "code": "SCANNED_PDF_NO_TEXT", "message": "Could not detect selectable text in this PDF. Please upload a digital PDF." } }`).
