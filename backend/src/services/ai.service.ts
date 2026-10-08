import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../config/env.js';
import { EnhanceBulletInput, BulletSuggestion } from '../schemas/ai.schema.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

import { callGroqChatCompletion } from '../utils/groq.js';

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!env.GEMINI_API_KEY) {
        logger.warn('AIService', 'GEMINI_API_KEY is not set in .env.');
        throw new AppError(
          'AI service is not configured on the backend. Please add GROQ_API_KEY or GEMINI_API_KEY.',
          503,
          'AI_UNCONFIGURED'
        );
      }
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return this.genAI;
  }

  static async enhanceBullet(input: EnhanceBulletInput): Promise<{
    originalBullet: string;
    suggestions: BulletSuggestion[];
  }> {
    logger.debug('AIService', `Enhance bullet requested [Framework: ${input.framework}]`, {
      bulletLength: input.rawBullet.length,
      context: input.sectionContext,
    });

    const systemInstruction = `You are a CV bullet-point editor. Your job is to rewrite a user's draft bullet so it is clearer, stronger and more professional, WITHOUT changing the facts.

## Core rule: fact preservation (highest priority)
A "fact" is any specific detail the user stated: numbers, percentages, dates, durations, team sizes, job titles, company/school names, technologies, tools, skills, awards, rankings and outcomes.

1. Keep EVERY fact from the draft. Do not drop, weaken or alter any of them.
2. NEVER invent facts. This includes metrics, percentages, dollar amounts, team sizes, time periods, technologies, tools, methods, projects or results that are not in the draft.
3. Do not infer how something was achieved. If the draft does not say what the person did to get the result, do not make up an action.
4. Keep numbers exactly as written (e.g. "top 10" stays "top 10", not "top 10%" or "95th percentile"; "3 months" stays "3 months").
5. Do not add facts by "rounding up" or converting (e.g. no changing "top 10" into a percentile).

## Handling missing information
- The XYZ and STAR frameworks work best with metrics, but if the draft has no metric, do NOT create one. Instead:
  - Write the strongest version using only the stated facts, and
  - Where a metric or detail would help, insert a clearly marked placeholder in square brackets, e.g. [X%], [number of students], [technology used], that the user can fill in.
- Include a short "missing_info" list telling the user what details would make the bullet stronger.

## Handling messy or unclear input
- Fix obvious typos and grammar silently (e.g. "ttop" -> "top", "bestt" -> "best").
- If the meaning is clear after fixing typos, refine it.
- If the meaning is genuinely ambiguous, do not guess. Keep to the most literal reading and set "needs_clarification" to true with a short question.

## Writing style
- Start with a strong past-tense action verb (present tense if it is a current role). Remove first-person pronouns ("I", "my").
- One sentence, ideally 15-30 words. Concise, specific, no filler or buzzwords.
- Professional tone. No exaggeration ("best", "world-class") unless it is a stated fact.
- Technical bullets: keep every technology name, version and tool exactly as given. Do not add related technologies.
- If a job description is provided, use its keywords ONLY where they match facts the user already stated. Never add a skill just because the job asks for it.

## Frameworks
- STAR: Situation/Task -> Action -> Result, compressed into one sentence, using only stated facts.
- XYZ: "Accomplished [X], as measured by [Y], by doing [Z]". Fill X, Y, Z only from the draft; use [placeholders] for anything missing.

## Output
Return ONLY valid JSON, no extra text:
{
  "options": [
    {
      "framework": "XYZ" | "STAR" | "Concise",
      "text": "...",
      "facts_preserved": ["each fact from the draft, as you kept it"],
      "placeholders_used": ["..."],
      "note": "one short line on why this version is stronger"
    }
  ],
  "missing_info": ["details that would strengthen this bullet"],
  "needs_clarification": false,
  "clarification_question": null
}
Provide 3 options. All 3 must contain the same facts, differing only in wording and structure.

## Final self-check before responding
- List every fact in the draft. Is each one in every option?
- Is there any number, tool, or claim in my output that is NOT in the draft and NOT a bracketed placeholder? If yes, remove it.`;

    const userPrompt = `Draft bullet: "${input.rawBullet}"
${input.sectionContext?.roleTitle ? `Role Title: ${input.sectionContext.roleTitle}` : ''}
${input.sectionContext?.organization ? `Organization/Company: ${input.sectionContext.organization}` : ''}
${input.sectionContext?.technologies?.length ? `Technologies mentioned: ${input.sectionContext.technologies.join(', ')}` : ''}
Preferred Framework: ${input.framework}

Please rewrite this draft bullet into 3 options adhering strictly to the fact-preservation rules and output JSON format.`;

    const parseOptionsToSuggestions = (parsed: any): BulletSuggestion[] => {
      const optionsList = Array.isArray(parsed.options)
        ? parsed.options
        : Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : [];

      return optionsList.map((opt: any, idx: number) => {
        const bulletText = opt.text || opt.enhancedText || '';
        const firstWord = bulletText.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '') || 'Engineered';
        const frameworkName = (opt.framework || '').toUpperCase().includes('STAR') ? 'STAR' : 'XYZ';
        return {
          id: `suggestion-${idx + 1}`,
          actionVerb: opt.actionVerb || firstWord,
          framework: frameworkName,
          enhancedText: bulletText,
          accomplishedX: Array.isArray(opt.facts_preserved) ? opt.facts_preserved.join('; ') : opt.accomplishedX || '',
          measuredY: Array.isArray(opt.placeholders_used) ? opt.placeholders_used.join(', ') : opt.measuredY || '',
          byDoingZ: opt.byDoingZ || '',
          explanation: opt.note || opt.explanation || (opt.placeholders_used?.length ? `Fill placeholders: ${opt.placeholders_used.join(', ')}` : 'Fact-preserved executive rewrite.'),
        };
      });
    };

    // 1. Primary Provider: Groq (ultra-low latency)
    if (env.GROQ_API_KEY) {
      try {
        const startTime = Date.now();
        const content = await callGroqChatCompletion({
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
          responseFormatJson: true,
          temperature: 0.6,
        });

        const parsed = JSON.parse(content);
        const suggestions = parseOptionsToSuggestions(parsed);

        if (suggestions.length > 0) {
          logger.info('AIService', `Bullet enhanced via Groq (${Date.now() - startTime}ms)`);
          return {
            originalBullet: input.rawBullet,
            suggestions,
          };
        }
      } catch (err: any) {
        logger.warn('AIService', `Groq bullet enhancement failed: ${err.message}. Falling back to secondary provider.`);
      }
    }

    if (!env.GEMINI_API_KEY) {
      logger.error('AIService', 'No AI API keys configured (GROQ_API_KEY or GEMINI_API_KEY required).');
      throw new AppError(
        'AI Provider is not configured on the backend. Please add GROQ_API_KEY or GEMINI_API_KEY.',
        503,
        'AI_UNCONFIGURED'
      );
    }

    const genAI = this.getClient();

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const startTime = Date.now();
        const model = genAI.getGenerativeModel({
          model: env.GEMINI_MODEL,
          systemInstruction,
          generationConfig: {
            temperature: 0.6,
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(userPrompt);
        const duration = Date.now() - startTime;
        const text = result.response.text();
        if (!text) throw new Error('Empty response received from Gemini API');

        const parsed = JSON.parse(text);
        const suggestions = parseOptionsToSuggestions(parsed);

        logger.info('AIService', `Google Gemini returned ${suggestions.length} suggestions (${duration}ms)`);

        return {
          originalBullet: input.rawBullet,
          suggestions,
        };
      } catch (err: any) {
        retries++;
        logger.warn('AIService', `Gemini API call failed (attempt ${retries}/${maxRetries}): ${err.message}`, {
          errorName: err.name,
        });

        if (retries >= maxRetries) {
          logger.error('AIService', '[CRITICAL_AI_OUTAGE] Gemini API retry budget exhausted', err);
          throw new AppError(
            'AI wording service is temporarily busy. Please try again in a few moments.',
            503,
            'AI_UNAVAILABLE'
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
      }
    }

    throw new AppError('AI service unavailable', 503, 'AI_UNAVAILABLE');
  }

  private static generateDevFallback(input: EnhanceBulletInput): {
    originalBullet: string;
    suggestions: BulletSuggestion[];
  } {
    const raw = input.rawBullet;
    return {
      originalBullet: raw,
      suggestions: [
        {
          id: 'dev-sug-1',
          actionVerb: 'Engineered',
          framework: 'XYZ',
          enhancedText: `Engineered scalable enhancements for ${raw.toLowerCase().replace(/^(i |we )/, '')}, boosting efficiency by 35% across key user workflows.`,
          accomplishedX: 'Boosted workflow execution efficiency by 35%',
          measuredY: '35% efficiency improvement',
          byDoingZ: 'Engineering scalable enhancements and modular component structures',
          explanation: 'Replaces generic wording with strong active power verb and quantifiable metric.',
        },
        {
          id: 'dev-sug-2',
          actionVerb: 'Optimized',
          framework: 'XYZ',
          enhancedText: `Optimized implementation pipelines and resolved bottlenecks in ${raw.toLowerCase().replace(/^(i |we )/, '')}, cutting latency by 40%.`,
          accomplishedX: 'Cut system latency by 40%',
          measuredY: '40% reduction in processing time',
          byDoingZ: 'Optimizing implementation pipelines and resolving execution bottlenecks',
          explanation: 'Frames the achievement around operational latency and speed gains.',
        },
      ],
    };
  }
}
