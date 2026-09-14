# API Contract: AI Bullet Enhancement (Google Gemini)

**Base URL**: `/api/ai`

---

## 1. Enhance Bullet Point (STAR/XYZ Rewrite)

Transforms a raw student bullet into 2–3 executive-grade achievement statements using the STAR or XYZ formula.

- **Method**: `POST`
- **Path**: `/api/ai/enhance-bullet`
- **Auth Required**: Yes (`requireAuth` middleware)

### Request Body
```json
{
  "rawBullet": "I made the website load faster by optimizing some images and code.",
  "sectionContext": {
    "roleTitle": "Junior Frontend Developer",
    "organization": "Tech Solutions Asia",
    "technologies": ["Next.js", "TypeScript", "Vercel"]
  },
  "framework": "XYZ"
}
```

### Zod Validation Schema
```typescript
export const enhanceBulletSchema = z.object({
  rawBullet: z.string().min(5, "Input must be at least 5 characters").max(500, "Input exceeds 500 characters"),
  sectionContext: z.object({
    roleTitle: z.string().optional(),
    organization: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  }).optional(),
  framework: z.enum(["STAR", "XYZ", "AUTO"]).default("XYZ"),
});
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "originalBullet": "I made the website load faster by optimizing some images and code.",
    "suggestions": [
      {
        "id": "sug-1",
        "actionVerb": "Optimized",
        "framework": "XYZ",
        "enhancedText": "Optimized client-side asset delivery and lazy-loaded media assets in Next.js, reducing average page load latency by 45%.",
        "accomplishedX": "Reduced average page load latency by 45%",
        "measuredY": "45% reduction in load time",
        "byDoingZ": "Optimizing asset delivery and lazy-loading Next.js media assets",
        "explanation": "Replaces weak phrasing ('made faster') with strong technical power verb and quantifiable performance metric."
      },
      {
        "id": "sug-2",
        "actionVerb": "Engineered",
        "framework": "XYZ",
        "enhancedText": "Engineered automated image compression pipelines and eliminated blocking scripts, boosting Google Lighthouse performance score from 62 to 94.",
        "accomplishedX": "Boosted Lighthouse performance score to 94",
        "measuredY": "+32 points in Lighthouse score",
        "byDoingZ": "Automating image compression and removing blocking scripts",
        "explanation": "Frames the achievement around standardized industry metrics (Lighthouse)."
      }
    ]
  }
}
```

### Error Responses
- `400 Bad Request`: Input bullet is too short (< 5 chars) or invalid schema.
- `503 Service Unavailable`: Google Gemini API rate limit or outage (`{ "success": false, "error": { "code": "AI_UNAVAILABLE", "message": "AI service temporarily unavailable. Please try again." } }`).
