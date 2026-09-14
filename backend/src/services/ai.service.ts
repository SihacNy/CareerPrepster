import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../config/env.js';
import { EnhanceBulletInput, BulletSuggestion } from '../schemas/ai.schema.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!env.GEMINI_API_KEY) {
        logger.warn('AIService', 'GEMINI_API_KEY is not set in .env. Falling back to development template generator.');
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

  static async enhanceBullet(input: EnhanceBulletInput): Promise<{
    originalBullet: string;
    suggestions: BulletSuggestion[];
  }> {
    logger.debug('AIService', `Enhance bullet requested [Framework: ${input.framework}]`, {
      bulletLength: input.rawBullet.length,
      context: input.sectionContext,
    });

    if (!env.GEMINI_API_KEY) {
      logger.error('AIService', 'GEMINI_API_KEY is missing from environment. Please set GEMINI_API_KEY in backend/.env');
      throw new AppError(
        'Google Gemini API Key is not configured on the backend. Please add GEMINI_API_KEY to your .env.',
        503,
        'AI_UNCONFIGURED'
      );
    }

    const genAI = this.getClient();

    const systemInstruction = `You are an elite executive career coach and ATS optimization engineer.
Your task is to transform raw student resume bullet points into high-impact, professional achievement statements following the STAR or XYZ methodology.
Formula XYZ: Accomplished [X] as measured by [Y], by doing [Z].
Formula STAR: Situation/Task -> Action with strong power verb -> Result with quantifiable metrics.
Always start each enhanced bullet with a strong action power verb (e.g., Engineered, Spearheaded, Architected, Accelerated, Reduced).
Always output 2 to 3 distinct, high-impact suggestions in valid JSON matching the requested schema.`;

    const userPrompt = `Raw student bullet: "${input.rawBullet}"
${input.sectionContext?.roleTitle ? `Role Title: ${input.sectionContext.roleTitle}` : ''}
${input.sectionContext?.organization ? `Organization/Company: ${input.sectionContext.organization}` : ''}
${input.sectionContext?.technologies?.length ? `Technologies: ${input.sectionContext.technologies.join(', ')}` : ''}
Target Framework: ${input.framework}

Please rewrite this bullet into 2-3 distinct executive-level options with strong action verbs and quantified impact metrics.`;

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const startTime = Date.now();
        const model = genAI.getGenerativeModel({
          model: env.GEMINI_MODEL,
          systemInstruction,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                suggestions: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      id: { type: SchemaType.STRING },
                      actionVerb: { type: SchemaType.STRING },
                      framework: { type: SchemaType.STRING, format: 'enum', enum: ['STAR', 'XYZ'] },
                      enhancedText: { type: SchemaType.STRING },
                      accomplishedX: { type: SchemaType.STRING },
                      measuredY: { type: SchemaType.STRING },
                      byDoingZ: { type: SchemaType.STRING },
                      explanation: { type: SchemaType.STRING },
                    },
                    required: [
                      'id',
                      'actionVerb',
                      'framework',
                      'enhancedText',
                      'accomplishedX',
                      'measuredY',
                      'byDoingZ',
                      'explanation',
                    ],
                  },
                },
              },
              required: ['suggestions'],
            },
          },
        });

        const result = await model.generateContent(userPrompt);
        const duration = Date.now() - startTime;
        const text = result.response.text();
        if (!text) throw new Error('Empty response received from Gemini API');

        const parsed = JSON.parse(text);
        logger.info('AIService', `Google Gemini returned ${parsed.suggestions?.length || 0} suggestions (${duration}ms)`);

        return {
          originalBullet: input.rawBullet,
          suggestions: parsed.suggestions || [],
        };
      } catch (err: any) {
        retries++;
        logger.warn('AIService', `Gemini API call failed (attempt ${retries}/${maxRetries}): ${err.message}`, {
          errorName: err.name,
        });

        if (retries >= maxRetries) {
          logger.error('AIService', 'Gemini API retry budget exhausted', err);
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
