# API Contract: Personalized Job Match

**Base Path**: `/api/jobs`  
**Authentication**: Required for all candidate endpoints (`HttpOnly` JWT cookie)  
**Content-Type**: `application/json`  

---

## 1. List Recommendations

### `GET /api/jobs/recommendations`

Retrieve paginated personalized job recommendations for the authenticated candidate with multi-facet filtering and sorting.

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | string | No | `ACTIVE` | `ACTIVE`, `SAVED`, `APPLIED`, `INTERVIEWING`, `ARCHIVED`, `ALL` |
| `minScore` | integer | No | `0` | Minimum match percentage (0–100) |
| `arrangement` | string | No | - | `REMOTE`, `HYBRID`, `ON_SITE` |
| `employmentType` | string | No | - | `FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT` |
| `search` | string | No | - | Text filter against job title, employer, or location |
| `sortBy` | string | No | `matchScore` | `matchScore`, `postedAt`, `discoveredAt` |
| `sortOrder` | string | No | `desc` | `asc` or `desc` |
| `page` | integer | No | `1` | Page number |
| `limit` | integer | No | `20` | Items per page (max 50) |

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "rec-123e4567-e89b-12d3-a456-426614174000",
        "overallScore": 88,
        "skillsScore": 92,
        "experienceScore": 85,
        "roleScore": 90,
        "matchedSkills": ["React", "TypeScript", "Tailwind CSS", "Node.js"],
        "missingSkills": ["Docker", "Jest"],
        "status": "ACTIVE",
        "userNotes": null,
        "job": {
          "id": "job-987f6543-e21b-12d3-a456-426614174999",
          "title": "Junior Full Stack Developer",
          "company": "TechInnovate Asia",
          "logoUrl": "https://img.logo.dev/techinnovate.com",
          "location": "Phnom Penh, Cambodia",
          "workArrangement": "HYBRID",
          "employmentType": "FULL_TIME",
          "minExperienceYears": 1,
          "sourcePlatform": "arbeitnow",
          "applicationUrl": "https://www.arbeitnow.com/jobs/techinnovate-fullstack-1234",
          "postedAt": "2026-09-28T08:00:00Z",
          "isActive": true
        },
        "createdAt": "2026-09-29T19:05:00Z"
      }
    ],
    "pagination": {
      "totalItems": 42,
      "totalPages": 3,
      "currentPage": 1,
      "pageSize": 20
    },
    "disclaimer": "Match score reflects profile-to-requirement alignment and does not represent a hiring probability or guarantee."
  }
}
```

---

## 2. Get Recommendation Details

### `GET /api/jobs/recommendations/:id`

Retrieve the comprehensive match analysis and full job listing details for a specific recommendation.

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "rec-123e4567-e89b-12d3-a456-426614174000",
    "overallScore": 88,
    "scores": {
      "overall": 88,
      "skills": 92,
      "experience": 85,
      "role": 90,
      "preference": 80
    },
    "matchedSkills": ["React", "TypeScript", "Tailwind CSS", "Node.js"],
    "missingSkills": ["Docker", "Jest"],
    "matchReasons": {
      "summary": "Strong technical alignment with your CV's capstone projects in Next.js and Express.",
      "evidenceReasons": [
        "Your project 'CareerPrepster' demonstrates practical full-stack Next.js and Express development.",
        "Your verified skills in TypeScript match 4 out of 5 required backend competencies."
      ],
      "skillGaps": [
        {
          "skill": "Docker",
          "criticality": "MEDIUM",
          "recommendation": "Add a Docker Compose configuration to your projects to bridge containerization requirements."
        }
      ]
    },
    "status": "ACTIVE",
    "userNotes": "Follow up next Tuesday after ATS tailoring.",
    "job": {
      "id": "job-987f6543-e21b-12d3-a456-426614174999",
      "title": "Junior Full Stack Developer",
      "company": "TechInnovate Asia",
      "logoUrl": "https://img.logo.dev/techinnovate.com",
      "location": "Phnom Penh, Cambodia",
      "workArrangement": "HYBRID",
      "employmentType": "FULL_TIME",
      "description": "We are seeking a motivated Junior Full Stack Developer to build modern web applications...",
      "requiredSkills": ["React", "TypeScript", "Node.js", "Docker"],
      "preferredSkills": ["Jest", "Tailwind CSS"],
      "minExperienceYears": 1,
      "sourcePlatform": "arbeitnow",
      "applicationUrl": "https://www.arbeitnow.com/jobs/techinnovate-fullstack-1234",
      "postedAt": "2026-09-28T08:00:00Z",
      "isActive": true
    }
  }
}
```

---

## 3. Update Recommendation Status

### `PATCH /api/jobs/recommendations/:id/status`

Update the candidate's tracking state for an opportunity (e.g. Save, Dismiss, Mark Applied).

#### Request Body:
```json
{
  "status": "SAVED",
  "userNotes": "Prepared customized resume with STAR bullets."
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "rec-123e4567-e89b-12d3-a456-426614174000",
    "status": "SAVED",
    "userNotes": "Prepared customized resume with STAR bullets.",
    "updatedAt": "2026-09-30T15:10:00Z"
  }
}
```

---

## 4. Get & Update Search Preferences

### `GET /api/jobs/preferences`
Retrieve the candidate's active search filters and notification settings.

### `PUT /api/jobs/preferences`
Save updated search criteria.

#### Request Body:
```json
{
  "desiredRoles": ["Frontend Developer", "Junior Full Stack Engineer"],
  "preferredLocations": ["Phnom Penh", "Remote"],
  "preferredArrangement": "REMOTE",
  "preferredEmploymentType": "FULL_TIME",
  "minSalary": 600,
  "notifyDaily": true
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "desiredRoles": ["Frontend Developer", "Junior Full Stack Engineer"],
    "preferredLocations": ["Phnom Penh", "Remote"],
    "preferredArrangement": "REMOTE",
    "preferredEmploymentType": "FULL_TIME",
    "minSalary": 600,
    "notifyDaily": true,
    "updatedAt": "2026-09-30T15:12:00Z"
  }
}
```

---

## 5. Trigger Match Refresh & Polling Status

### `POST /api/jobs/refresh`
Trigger an asynchronous recalculation of job matches against the candidate's current CV and preferences.

#### Response `202 Accepted`:
```json
{
  "success": true,
  "message": "Job match recalculation dispatched.",
  "data": {
    "jobId": "match-job-abc-123",
    "status": "QUEUED"
  }
}
```

#### Error Response `429 Too Many Requests`:
```json
{
  "success": false,
  "error": "Refresh cooldown active. Please wait before triggering another recalculation.",
  "retryAfterSeconds": 720
}
```

### `GET /api/jobs/refresh/status`
Poll the status of the background matching job and get cooldown timing.

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "status": "IDLE",
    "lastRefreshedAt": "2026-09-30T15:00:00Z",
    "cooldownSecondsRemaining": 0,
    "canRefresh": true
  }
}
```
