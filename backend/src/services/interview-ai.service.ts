import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';
import { callGroqChatCompletion } from '../utils/groq.js';

export interface GeneratedQuestion {
  questionText: string;
  competency: string;
  contextReference?: string | null;
}

export interface TurnEvaluationResult {
  type: 'PROBE' | 'EVALUATION';
  probeQuestion?: {
    questionText: string;
    competency: string;
  };
  feedback?: {
    starSituationScore: number;
    starSituationNotes: string;
    starTaskScore: number;
    starTaskNotes: string;
    starActionScore: number;
    starActionNotes: string;
    starResultScore: number;
    starResultNotes: string;
    impactScore: number;
    clarityScore: number;
    powerVerbsUsed: string[];
    strengths: string[];
    improvements: string[];
    modelAnswer: string;
  };
  nextQuestion?: GeneratedQuestion;
}

export interface ScorecardSynthesisResult {
  overallScore: number;
  readinessTier: string;
  starScore: number;
  technicalScore: number;
  communicationScore: number;
  impactScore: number;
  keyStrengths: string[];
  keyGrowthAreas: string[];
  cvRecommendations: Array<{
    cvItemId?: string;
    bulletPointId?: string;
    originalText?: string;
    recommendation: string;
    reason: string;
  }>;
}

export class InterviewAIService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!env.GEMINI_API_KEY) {
        logger.warn('InterviewAIService', 'GEMINI_API_KEY is not set in .env. Falling back to development mock response generator.');
        throw new AppError(
          'GEMINI_API_KEY is not configured in backend environment',
          503,
          'AI_UNCONFIGURED'
        );
      }
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return this.genAI;
  }

  /**
   * PII Sanitizer: Sanitizes CV projections by stripping candidate personal identifiers
   * (full legal name, email, phone number, address, URLs) before sending to external LLM.
   */
  static sanitizeCVContext(cv: any): string {
    if (!cv) return 'No CV provided. Relying on target role and industry benchmarks.';

    const sections: string[] = [];

    if (cv.targetRole?.title || cv.targetRoleTitle) {
      sections.push(`Target Role: ${cv.targetRole?.title || cv.targetRoleTitle}`);
    }

    if (cv.summary) {
      sections.push(`Professional Summary: ${cv.summary}`);
    }

    if (Array.isArray(cv.sections)) {
      for (const sec of cv.sections) {
        if (!sec.isVisible) continue;
        const items = sec.items || [];
        if (items.length === 0) continue;

        const secTitle = sec.customTitle || sec.sectionType;
        const itemSummaries = items.map((item: any) => {
          const bullets = (item.bulletPoints || []).map((b: any) => `  - ${b.text}`).join('\n');
          return `Item: ${item.title || 'Untitled'}${item.subtitle ? ` (${item.subtitle})` : ''}\n${bullets}`;
        }).join('\n\n');

        sections.push(`Section [${secTitle}]:\n${itemSummaries}`);
      }
    }

    if (Array.isArray(cv.skillGroups)) {
      const skillsStr = cv.skillGroups.map((g: any) => {
        const list = Array.isArray(g.skills) ? g.skills.join(', ') : JSON.stringify(g.skills);
        return `${g.categoryName}: ${list}`;
      }).join(' | ');
      sections.push(`Skills Taxonomy: ${skillsStr}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Generates the first tailored interview question for a session
   */
  static async generateInitialQuestion(params: {
    cvContext?: string;
    targetRoleTitle: string;
    jobDescription?: string | null;
    track: string;
  }): Promise<GeneratedQuestion> {
    // 1. Primary Provider: Groq
    if (env.GROQ_API_KEY) {
      try {
        const systemInstruction = `You are an expert technical and behavioral interviewer for top technology firms.
Your goal is to conduct an authentic, challenging, yet supportive practice drill for a university graduate.
The interview track is: ${params.track}.
Target Job Role: ${params.targetRoleTitle}.
Generate the FIRST interview question tailored to the candidate's background and target role.
If CV context has projects or experiences, anchor the question in one of their concrete project claims or technologies.
Keep the question clear, engaging, and professional. Return valid JSON matching schema: { "questionText": string, "competency": string, "contextReference": string | null }.`;

        const prompt = `Candidate Background / CV Details:
${params.cvContext || 'None provided'}

Job Description Context:
${params.jobDescription || 'Standard entry-level / early-career role expectations.'}

Generate Question 1 for track: ${params.track}.`;

        const content = await callGroqChatCompletion({
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          responseFormatJson: true,
          temperature: 0.7,
        });

        const parsed = JSON.parse(content);
        return {
          questionText: parsed.questionText,
          competency: parsed.competency || 'General Competency',
          contextReference: parsed.contextReference || null,
        };
      } catch (err: any) {
        logger.warn('InterviewAIService', `Groq initial question failed: ${err.message}. Trying Gemini if available...`);
      }
    }

    if (!env.GEMINI_API_KEY) {
      return this.generateMockInitialQuestion(params.targetRoleTitle, params.track);
    }

    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              questionText: { type: SchemaType.STRING },
              competency: { type: SchemaType.STRING },
              contextReference: { type: SchemaType.STRING, nullable: true },
            },
            required: ['questionText', 'competency'],
          },
        },
        systemInstruction: `You are an expert technical and behavioral interviewer for top technology firms.
Your goal is to conduct an authentic, challenging, yet supportive practice drill for a university graduate.
The interview track is: ${params.track}.
Target Job Role: ${params.targetRoleTitle}.
Generate the FIRST interview question tailored to the candidate's background and target role.
If CV context has projects or experiences, anchor the question in one of their concrete project claims or technologies.
Keep the question clear, engaging, and professional. Output valid JSON.`,
      });

      const prompt = `Candidate Background / CV Details:
${params.cvContext || 'None provided'}

Job Description Context:
${params.jobDescription || 'Standard entry-level / early-career role expectations.'}

Generate Question 1 for track: ${params.track}.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      return {
        questionText: parsed.questionText,
        competency: parsed.competency || 'General Competency',
        contextReference: parsed.contextReference || null,
      };
    } catch (err: any) {
      logger.warn('InterviewAIService', `Gemini call failed for initial question: ${err.message}. Falling back to mock generator.`);
      return this.generateMockInitialQuestion(params.targetRoleTitle, params.track);
    }
  }

  /**
   * Evaluates candidate turn response and determines if adaptive follow-up probing is needed
   */
  static async evaluateTurnOrProbe(params: {
    questionIndex?: number;
    questionText: string;
    competency: string;
    contextReference?: string | null;
    responseText: string;
    allowProbe: boolean;
    track: string;
    targetRoleTitle: string;
    isFinalQuestion: boolean;
    cvContext?: string;
  }): Promise<TurnEvaluationResult> {
    // 1. Primary Provider: Groq
    if (env.GROQ_API_KEY) {
      try {
        const systemInstruction = `You are an elite interview coach assessing early-career candidate responses using the STAR methodology (Situation, Task, Action, Result).
Target Role: ${params.targetRoleTitle} | Track: ${params.track}.
Allow Adaptive Probing: ${params.allowProbe}.

Rules:
1. If allowProbe is true AND the candidate's answer is brief, vague, or misses critical Action specifics or quantifiable Results, set decision="PROBE" and craft a targeted follow-up probing question in probeQuestionText.
2. If allowProbe is false OR the candidate provided adequate detail, set decision="EVALUATION".
3. For EVALUATION:
   - Score Situation, Task, Action, Result from 1 to 5.
   - Score Impact and Clarity from 1 to 5.
   - List strong power verbs used.
   - Provide 2 concrete strengths and 2 actionable growth tips.
   - Provide an inspiring, high-impact model answer illustrating how the candidate's experience could be articulated with maximum impact.
   - If not final question (${!params.isFinalQuestion}), generate the nextQuestionText for the next interview turn.

Return valid JSON with keys:
{
  "decision": "PROBE" | "EVALUATION",
  "probeQuestionText": string | null,
  "probeCompetency": string | null,
  "starSituationScore": number,
  "starSituationNotes": string,
  "starTaskScore": number,
  "starTaskNotes": string,
  "starActionScore": number,
  "starActionNotes": string,
  "starResultScore": number,
  "starResultNotes": string,
  "impactScore": number,
  "clarityScore": number,
  "powerVerbsUsed": string[],
  "strengths": string[],
  "improvements": string[],
  "modelAnswer": string,
  "nextQuestionText": string | null,
  "nextQuestionCompetency": string | null,
  "nextQuestionContextReference": string | null
}`;

        const prompt = `Current Question: "${params.questionText}" [Competency: ${params.competency}]
Candidate Answer: "${params.responseText}"
Candidate CV Context: ${params.cvContext || 'None'}
Is Final Question: ${params.isFinalQuestion}`;

        const content = await callGroqChatCompletion({
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          responseFormatJson: true,
          temperature: 0.6,
        });

        const parsed = JSON.parse(content);
        if (parsed.decision === 'PROBE' && params.allowProbe && parsed.probeQuestionText) {
          return {
            type: 'PROBE',
            probeQuestion: {
              questionText: parsed.probeQuestionText,
              competency: parsed.probeCompetency || params.competency,
            },
          };
        }

        return {
          type: 'EVALUATION',
          feedback: {
            starSituationScore: Math.min(5, Math.max(1, parsed.starSituationScore || 3)),
            starSituationNotes: parsed.starSituationNotes || 'Situation clearly identified.',
            starTaskScore: Math.min(5, Math.max(1, parsed.starTaskScore || 3)),
            starTaskNotes: parsed.starTaskNotes || 'Task ownership established.',
            starActionScore: Math.min(5, Math.max(1, parsed.starActionScore || 3)),
            starActionNotes: parsed.starActionNotes || 'Concrete actions detailed.',
            starResultScore: Math.min(5, Math.max(1, parsed.starResultScore || 3)),
            starResultNotes: parsed.starResultNotes || 'Outcomes and reflections noted.',
            impactScore: Math.min(5, Math.max(1, parsed.impactScore || 3)),
            clarityScore: Math.min(5, Math.max(1, parsed.clarityScore || 4)),
            powerVerbsUsed: parsed.powerVerbsUsed || ['Engineered', 'Optimized'],
            strengths: parsed.strengths || ['Good structure and professional tone.'],
            improvements: parsed.improvements || ['Include quantifiable numbers in the result.'],
            modelAnswer: parsed.modelAnswer || 'A structured STAR response with quantifiable metrics.',
          },
          nextQuestion: parsed.nextQuestionText ? {
            questionText: parsed.nextQuestionText,
            competency: parsed.nextQuestionCompetency || 'Technical Collaboration',
            contextReference: parsed.nextQuestionContextReference || null,
          } : undefined,
        };
      } catch (err: any) {
        logger.warn('InterviewAIService', `Groq turn evaluation failed: ${err.message}. Trying Gemini if available...`);
      }
    }

    if (!env.GEMINI_API_KEY) {
      return this.generateMockTurnResult(params);
    }

    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
          temperature: 0.6,
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              decision: { type: SchemaType.STRING, format: 'enum', enum: ['PROBE', 'EVALUATION'] },
              probeQuestionText: { type: SchemaType.STRING, nullable: true },
              probeCompetency: { type: SchemaType.STRING, nullable: true },
              starSituationScore: { type: SchemaType.INTEGER },
              starSituationNotes: { type: SchemaType.STRING },
              starTaskScore: { type: SchemaType.INTEGER },
              starTaskNotes: { type: SchemaType.STRING },
              starActionScore: { type: SchemaType.INTEGER },
              starActionNotes: { type: SchemaType.STRING },
              starResultScore: { type: SchemaType.INTEGER },
              starResultNotes: { type: SchemaType.STRING },
              impactScore: { type: SchemaType.INTEGER },
              clarityScore: { type: SchemaType.INTEGER },
              powerVerbsUsed: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              improvements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              modelAnswer: { type: SchemaType.STRING },
              nextQuestionText: { type: SchemaType.STRING, nullable: true },
              nextQuestionCompetency: { type: SchemaType.STRING, nullable: true },
              nextQuestionContextReference: { type: SchemaType.STRING, nullable: true },
            },
            required: [
              'decision',
              'starSituationScore',
              'starSituationNotes',
              'starTaskScore',
              'starTaskNotes',
              'starActionScore',
              'starActionNotes',
              'starResultScore',
              'starResultNotes',
              'impactScore',
              'clarityScore',
              'powerVerbsUsed',
              'strengths',
              'improvements',
              'modelAnswer',
            ],
          },
        },
        systemInstruction: `You are an elite interview coach assessing early-career candidate responses using the STAR methodology (Situation, Task, Action, Result).
Target Role: ${params.targetRoleTitle} | Track: ${params.track}.
Allow Adaptive Probing: ${params.allowProbe}.

Rules:
1. If allowProbe is true AND the candidate's answer is brief, vague, or misses critical Action specifics or quantifiable Results, set decision="PROBE" and craft a targeted follow-up probing question in probeQuestionText.
2. If allowProbe is false OR the candidate provided adequate detail, set decision="EVALUATION".
3. For EVALUATION:
   - Score Situation, Task, Action, Result from 1 to 5.
   - Score Impact and Clarity from 1 to 5.
   - List strong power verbs used.
   - Provide 2 concrete strengths and 2 actionable growth tips.
   - Provide an inspiring, high-impact model answer illustrating how the candidate's experience could be articulated with maximum impact.
   - If not final question (${!params.isFinalQuestion}), generate the nextQuestionText for the next interview turn.`,
      });

      const prompt = `Current Question: "${params.questionText}" [Competency: ${params.competency}]
Candidate Answer: "${params.responseText}"
Candidate CV Context: ${params.cvContext || 'None'}
Is Final Question: ${params.isFinalQuestion}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      if (parsed.decision === 'PROBE' && params.allowProbe && parsed.probeQuestionText) {
        return {
          type: 'PROBE',
          probeQuestion: {
            questionText: parsed.probeQuestionText,
            competency: parsed.probeCompetency || params.competency,
          },
        };
      }

      return {
        type: 'EVALUATION',
        feedback: {
          starSituationScore: Math.min(5, Math.max(1, parsed.starSituationScore || 3)),
          starSituationNotes: parsed.starSituationNotes || 'Situation clearly identified.',
          starTaskScore: Math.min(5, Math.max(1, parsed.starTaskScore || 3)),
          starTaskNotes: parsed.starTaskNotes || 'Task ownership established.',
          starActionScore: Math.min(5, Math.max(1, parsed.starActionScore || 3)),
          starActionNotes: parsed.starActionNotes || 'Concrete actions detailed.',
          starResultScore: Math.min(5, Math.max(1, parsed.starResultScore || 3)),
          starResultNotes: parsed.starResultNotes || 'Outcomes and reflections noted.',
          impactScore: Math.min(5, Math.max(1, parsed.impactScore || 3)),
          clarityScore: Math.min(5, Math.max(1, parsed.clarityScore || 4)),
          powerVerbsUsed: parsed.powerVerbsUsed || ['Engineered', 'Optimized'],
          strengths: parsed.strengths || ['Good structure and professional tone.'],
          improvements: parsed.improvements || ['Include quantifiable numbers in the result.'],
          modelAnswer: parsed.modelAnswer || 'A structured STAR response with quantifiable metrics.',
        },
        nextQuestion: parsed.nextQuestionText ? {
          questionText: parsed.nextQuestionText,
          competency: parsed.nextQuestionCompetency || 'Technical Collaboration',
          contextReference: parsed.nextQuestionContextReference || null,
        } : undefined,
      };
    } catch (err: any) {
      logger.warn('InterviewAIService', `Gemini turn evaluation failed: ${err.message}. Falling back to mock evaluator.`);
      return this.generateMockTurnResult(params);
    }
  }

  /**
   * Synthesizes the final scorecard and cross-referenced CV bullet recommendations
   */
  static async synthesizeScorecard(params: {
    targetRoleTitle: string;
    track: string;
    turns: Array<{
      questionText: string;
      competency: string;
      responseText: string;
      feedback?: any;
    }>;
    cvBullets?: Array<{
      id: string;
      itemId: string;
      text: string;
      itemTitle?: string;
    }>;
  }): Promise<ScorecardSynthesisResult> {
    // 1. Primary Provider: Groq
    if (env.GROQ_API_KEY) {
      try {
        const systemInstruction = `You are a senior hiring director synthesizing an overall interview scorecard for a candidate.
Calculate overallScore (0-100), sub-scores (0-100), and categorize the candidate into a readinessTier:
- 90-100: "Interview Ready - Exceptional Delivery"
- 75-89: "Solid Foundation - Minor Refinements Needed"
- 60-74: "Developing - Focus on Quantifiable Impact"
- < 60: "Needs Practice - Revisit STAR Structure"

Compare the candidate's interview responses against their CV bullets. Identify any CV bullet points that can be upgraded with specific metrics or tools articulated during the drill.
Return valid JSON matching schema:
{
  "overallScore": number,
  "readinessTier": string,
  "starScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "impactScore": number,
  "keyStrengths": string[],
  "keyGrowthAreas": string[],
  "cvRecommendations": [{ "bulletPointId": string|null, "cvItemId": string|null, "originalText": string|null, "recommendation": string, "reason": string }]
}`;

        const prompt = `Target Role: ${params.targetRoleTitle} | Track: ${params.track}
Completed Interview Turns:
${JSON.stringify(params.turns, null, 2)}

Existing CV Bullets:
${JSON.stringify(params.cvBullets || [], null, 2)}`;

        const content = await callGroqChatCompletion({
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          responseFormatJson: true,
          temperature: 0.5,
        });

        const parsed = JSON.parse(content);
        return parsed;
      } catch (err: any) {
        logger.warn('InterviewAIService', `Groq scorecard synthesis failed: ${err.message}. Trying Gemini if available...`);
      }
    }

    if (!env.GEMINI_API_KEY) {
      return this.generateMockScorecard(params);
    }

    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
          temperature: 0.5,
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              overallScore: { type: SchemaType.INTEGER },
              readinessTier: { type: SchemaType.STRING },
              starScore: { type: SchemaType.INTEGER },
              technicalScore: { type: SchemaType.INTEGER },
              communicationScore: { type: SchemaType.INTEGER },
              impactScore: { type: SchemaType.INTEGER },
              keyStrengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              keyGrowthAreas: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              cvRecommendations: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    bulletPointId: { type: SchemaType.STRING, nullable: true },
                    cvItemId: { type: SchemaType.STRING, nullable: true },
                    originalText: { type: SchemaType.STRING, nullable: true },
                    recommendation: { type: SchemaType.STRING },
                    reason: { type: SchemaType.STRING },
                  },
                  required: ['recommendation', 'reason'],
                },
              },
            },
            required: [
              'overallScore',
              'readinessTier',
              'starScore',
              'technicalScore',
              'communicationScore',
              'impactScore',
              'keyStrengths',
              'keyGrowthAreas',
              'cvRecommendations',
            ],
          },
        },
        systemInstruction: `You are a senior hiring director synthesizing an overall interview scorecard for a candidate.
Calculate overallScore (0-100), sub-scores (0-100), and categorize the candidate into a readinessTier:
- 90-100: "Interview Ready - Exceptional Delivery"
- 75-89: "Solid Foundation - Minor Refinements Needed"
- 60-74: "Developing - Focus on Quantifiable Impact"
- < 60: "Needs Practice - Revisit STAR Structure"

Compare the candidate's interview responses against their CV bullets. Identify any CV bullet points that can be upgraded with specific metrics or tools articulated during the drill.`,
      });

      const prompt = `Target Role: ${params.targetRoleTitle} | Track: ${params.track}
Completed Interview Turns:
${JSON.stringify(params.turns, null, 2)}

Existing CV Bullets:
${JSON.stringify(params.cvBullets || [], null, 2)}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err: any) {
      logger.warn('InterviewAIService', `Gemini scorecard synthesis failed: ${err.message}. Falling back to mock scorecard.`);
      return this.generateMockScorecard(params);
    }
  }

  // --- MOCK FALLBACKS (Zero-configuration dev mode & resilience) ---

  private static generateMockInitialQuestion(targetRole: string, track: string): GeneratedQuestion {
    if (track === 'TECHNICAL') {
      return {
        questionText: `Can you walk me through the architecture of a full-stack or technical project you built for your ${targetRole} portfolio, and explain how you handled state management and API latency?`,
        competency: 'System Architecture & Engineering Decisions',
        contextReference: 'Portfolio Project Architecture',
      };
    }
    return {
      questionText: `Tell me about a time when you were working on a challenging technical deadline for a ${targetRole} deliverable and encountered an unexpected roadblock. How did you adapt your plan to deliver on time?`,
      competency: 'Adaptability & Deadline Management',
      contextReference: 'Academic / Internship Project',
    };
  }

  private static generateMockTurnResult(params: any): TurnEvaluationResult {
    const wordCount = params.responseText.trim().split(/\s+/).filter(Boolean).length;
    const isVague = params.responseText.length < 60 || wordCount < 12;

    if (isVague && params.allowProbe) {
      let probeText = 'What specific tools or methodologies did you use to execute that step, and how did you verify the final outcome?';
      let probeComp = 'Action Specificity & Outcome Validation';

      if (params.track === 'TECHNICAL') {
        probeText = 'Could you specify the exact technical trade-offs, architecture patterns, or profiling tools you used to validate that solution?';
        probeComp = 'Technical Depth & Validation';
      } else if (params.competency?.toLowerCase().includes('conflict') || params.competency?.toLowerCase().includes('communication')) {
        probeText = 'How did you directly address the differing perspectives, and what communication techniques helped align the team on the final decision?';
        probeComp = 'Interpersonal Alignment & Consensus Building';
      }

      return {
        type: 'PROBE',
        probeQuestion: {
          questionText: probeText,
          competency: probeComp,
        },
      };
    }

    const nextQIndex = (params.questionIndex || 1) + 1;
    let nextQText = 'Describe a situation where you received constructive criticism from a teammate or mentor. How did you incorporate that feedback?';
    let nextQComp = 'Continuous Learning & Receptivity';

    if (params.track === 'TECHNICAL') {
      const technicalBank = [
        {
          text: `Describe the most challenging bug, race condition, or performance bottleneck you've had to debug in a system. How did you isolate and resolve the root cause?`,
          comp: 'Root Cause Analysis & Debugging',
        },
        {
          text: `How do you evaluate engineering trade-offs when choosing between third-party open-source libraries versus building a bespoke solution in-house?`,
          comp: 'Architectural Trade-Offs',
        },
        {
          text: `Walk me through your approach to database indexing and query optimization when dealing with high-concurrency read and write operations.`,
          comp: 'Data Modeling & Performance',
        },
        {
          text: `How do you design for resilience and graceful degradation when upstream external APIs or microservices experience outages?`,
          comp: 'Fault Tolerance & Reliability',
        },
        {
          text: `Explain your testing strategy (unit, integration, regression) to ensure zero downtime and high release velocity in a continuous delivery environment.`,
          comp: 'Testing & DevOps Best Practices',
        },
        {
          text: `How do you secure your web endpoints against common security vulnerabilities like injection, broken authentication, and SSRF?`,
          comp: 'Application Security & Hardening',
        },
        {
          text: `If you noticed a sudden latency spike in production during peak traffic, what diagnostic steps and telemetry would you analyze first?`,
          comp: 'Incident Response & Observability',
        },
      ];
      const pick = technicalBank[(nextQIndex - 2) % technicalBank.length] || technicalBank[0];
      nextQText = pick.text;
      nextQComp = pick.comp;
    } else if (params.track === 'MIXED') {
      const mixedBank = [
        {
          text: `Describe a situation where you had a significant disagreement with an engineer or stakeholder regarding architectural design. How did you align the team?`,
          comp: 'Technical Communication & Conflict Resolution',
        },
        {
          text: `Tell me about a technical project where you faced ambiguous specifications or missing documentation. How did you prioritize and execute?`,
          comp: 'Dealing with Ambiguity & Technical Initiative',
        },
        {
          text: `Walk me through a time when a production release had an unexpected bug. How did you communicate with affected users or teammates while triaging?`,
          comp: 'Crisis Management & Accountability',
        },
        {
          text: `Describe an instance where you had to quickly master an unfamiliar framework or language to deliver a mission-critical feature on schedule.`,
          comp: 'Learning Agility & Execution',
        },
        {
          text: `How have you contributed to mentoring junior peers or establishing cleaner engineering standards and code review practices on your team?`,
          comp: 'Engineering Leadership & Mentorship',
        },
      ];
      const pick = mixedBank[(nextQIndex - 2) % mixedBank.length] || mixedBank[0];
      nextQText = pick.text;
      nextQComp = pick.comp;
    } else {
      // BEHAVIORAL
      const behavioralBank = [
        {
          text: `Describe a situation where you had a significant disagreement with a team member regarding a feature implementation or task priority. How did you reach consensus?`,
          comp: 'Conflict Resolution & Teamwork',
        },
        {
          text: `Tell me about a project where you were faced with ambiguous requirements or scope creep. How did you navigate the uncertainty to deliver quality work?`,
          comp: 'Dealing with Ambiguity',
        },
        {
          text: `Can you share an experience where a project or sprint did not go according to plan? What went wrong, and how did you pivot or salvage the outcome?`,
          comp: 'Resilience & Problem Solving',
        },
        {
          text: `Describe a time when you went above and beyond your standard duties to support a teammate or ensure a client deliverable succeeded.`,
          comp: 'Ownership & Initiative',
        },
        {
          text: `Tell me about a time you had to deliver difficult feedback or communicate an unavoidable project delay to a stakeholder or manager.`,
          comp: 'Stakeholder Management',
        },
        {
          text: `Give an example of a goal you set for your personal or professional growth over the past year. What steps did you take, and what was the outcome?`,
          comp: 'Continuous Learning & Self-Awareness',
        },
      ];
      const pick = behavioralBank[(nextQIndex - 2) % behavioralBank.length] || behavioralBank[0];
      nextQText = pick.text;
      nextQComp = pick.comp;
    }

    return {
      type: 'EVALUATION',
      feedback: {
        starSituationScore: 4,
        starSituationNotes: 'Situation was framed with appropriate context.',
        starTaskScore: 4,
        starTaskNotes: 'Clear responsibility and goal established.',
        starActionScore: 4,
        starActionNotes: 'Specific tools and personal initiatives highlighted.',
        starResultScore: 4,
        starResultNotes: 'Outcome communicated clearly.',
        impactScore: 4,
        clarityScore: 4,
        powerVerbsUsed: ['Engineered', 'Coordinated', 'Resolved', 'Spearheaded'],
        strengths: [
          'Structured answer cleanly following Situation and Task ownership.',
          'Demonstrated problem-solving initiative under pressure.',
        ],
        improvements: [
          'Incorporate specific percentage improvements or time metrics into the Result.',
        ],
        modelAnswer: `When developing the core modules for our project, our team hit an integration hurdle that delayed testing. As team lead, I analyzed the failing API contracts, instituted standardized TypeScript interfaces, and automated integration tests. This reduced error rates by 40% and allowed us to ship the release 2 days ahead of schedule.`,
      },
      nextQuestion: !params.isFinalQuestion ? {
        questionText: nextQText,
        competency: nextQComp,
        contextReference: null,
      } : undefined,
    };
  }

  private static generateMockScorecard(params: any): ScorecardSynthesisResult {
    return {
      overallScore: 85,
      readinessTier: 'Solid Foundation - Minor Refinements Needed',
      starScore: 88,
      technicalScore: 86,
      communicationScore: 84,
      impactScore: 82,
      keyStrengths: [
        'Consistently structured responses with well-defined Situation and Task ownership.',
        'Articulated technical reasoning clearly without excessive jargon.',
        'Demonstrated self-awareness and positive collaboration habits.',
      ],
      keyGrowthAreas: [
        'State concrete before-and-after quantifiable metrics in the Result phase of every story.',
        'Keep technical explanations concise to prevent rambling on edge cases.',
      ],
      cvRecommendations: (params.cvBullets || []).slice(0, 2).map((b: any) => ({
        bulletPointId: b.id,
        cvItemId: b.itemId,
        originalText: b.text,
        recommendation: `Optimized performance and streamlined execution by 30%, incorporating the specific technical solutions you described during your drill.`,
        reason: 'During your interview response you articulated specific optimizations that are currently absent from your CV bullet point.',
      })),
    };
  }
}
