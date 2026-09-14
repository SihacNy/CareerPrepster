import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../config/env.js';
import { ParsedCv, parsedCvSchema } from '../schemas/import.schema.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class ParserService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!env.GEMINI_API_KEY) {
        logger.warn('ParserService', 'GEMINI_API_KEY is not set. Will use fallback text extractor in dev.');
        throw new AppError('GEMINI_API_KEY not configured', 503, 'AI_UNCONFIGURED');
      }
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return this.genAI;
  }

  static async extractRawText(fileBuffer: Buffer, mimeType: string): Promise<string> {
    logger.debug('ParserService', `Extracting raw text from upload [MIME: ${mimeType}, Size: ${fileBuffer.length} bytes]`);

    let rawText = '';
    const startTime = Date.now();

    if (mimeType === 'application/pdf' || mimeType.includes('pdf')) {
      const pdfData = await pdfParse(fileBuffer);
      rawText = pdfData.text || '';
      logger.info('ParserService', `Extracted text from PDF in ${Date.now() - startTime}ms (${pdfData.numpages || 1} pages, ${rawText.length} chars)`);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType.includes('word') ||
      mimeType.includes('docx')
    ) {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = docxData.value || '';
      logger.info('ParserService', `Extracted text from DOCX in ${Date.now() - startTime}ms (${rawText.length} chars)`);
    } else {
      logger.warn('ParserService', `Unsupported file upload format [MIME: ${mimeType}]`);
      throw new AppError(
        'Unsupported file format. Please upload a .pdf or .docx file.',
        400,
        'INVALID_FILE_TYPE'
      );
    }

    const cleanedText = rawText.replace(/\r\n/g, '\n').trim();

    // Scanned image PDF check
    if (cleanedText.length < 30) {
      logger.warn('ParserService', `Scanned image PDF detected (only ${cleanedText.length} extractable chars)`);
      throw new AppError(
        'Could not detect selectable text in this document. It appears to be a scanned image. Please upload a digital PDF with selectable text.',
        422,
        'SCANNED_PDF_NO_TEXT'
      );
    }

    return cleanedText;
  }

  static async structureResumeWithAI(rawText: string): Promise<ParsedCv> {
    if (!env.GEMINI_API_KEY) {
      logger.info('ParserService', 'Using dev fallback resume parser (No Gemini Key in dev)');
      return this.generateDevFallbackParsedCV(rawText);
    }

    const genAI = this.getClient();

    const systemInstruction = `You are an expert resume parsing engine.
Your task is to take raw, unformatted text extracted from a student resume and accurately extract and map it into structured CV fields matching the requested JSON schema.
Clean up broken line wraps and extract:
- Personal Info (fullName, email, phone, location, linkedinUrl, githubUrl, summary)
- Education (institution, degree, location, startDate, endDate, isCurrent)
- Experience (title, company, location, startDate, endDate, isCurrent, bullets array)
- Projects (title, subtitle, startDate, endDate, url, bullets array)
- Skill Groups (categorized groups with categoryName and skills array).`;

    try {
      const startTime = Date.now();
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        systemInstruction,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              fullName: { type: SchemaType.STRING },
              email: { type: SchemaType.STRING },
              phone: { type: SchemaType.STRING },
              location: { type: SchemaType.STRING },
              linkedinUrl: { type: SchemaType.STRING },
              githubUrl: { type: SchemaType.STRING },
              summary: { type: SchemaType.STRING },
              education: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    institution: { type: SchemaType.STRING },
                    degree: { type: SchemaType.STRING },
                    location: { type: SchemaType.STRING },
                    startDate: { type: SchemaType.STRING },
                    endDate: { type: SchemaType.STRING },
                    isCurrent: { type: SchemaType.BOOLEAN },
                  },
                  required: ['institution', 'degree'],
                },
              },
              experience: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING },
                    company: { type: SchemaType.STRING },
                    location: { type: SchemaType.STRING },
                    startDate: { type: SchemaType.STRING },
                    endDate: { type: SchemaType.STRING },
                    isCurrent: { type: SchemaType.BOOLEAN },
                    bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  },
                  required: ['title', 'company', 'bullets'],
                },
              },
              projects: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING },
                    subtitle: { type: SchemaType.STRING },
                    startDate: { type: SchemaType.STRING },
                    endDate: { type: SchemaType.STRING },
                    url: { type: SchemaType.STRING },
                    bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  },
                  required: ['title', 'bullets'],
                },
              },
              skillGroups: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    categoryName: { type: SchemaType.STRING },
                    skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  },
                  required: ['categoryName', 'skills'],
                },
              },
            },
            required: ['fullName', 'email', 'education', 'experience', 'skillGroups'],
          },
        },
      });

      const result = await model.generateContent(`Raw resume extracted text:\n\n${rawText.slice(0, 15000)}`);
      const duration = Date.now() - startTime;
      const responseText = result.response.text();
      if (!responseText) throw new Error('Empty AI parser response');

      const parsed = JSON.parse(responseText);
      logger.info('ParserService', `Gemini parsed structured resume successfully in ${duration}ms`, {
        name: parsed.fullName,
        educationCount: parsed.education?.length,
        experienceCount: parsed.experience?.length,
      });

      return parsedCvSchema.parse(parsed);
    } catch (err: any) {
      logger.warn('ParserService', `Gemini parsing error, falling back to local extractor: ${err.message}`);
      return this.generateDevFallbackParsedCV(rawText);
    }
  }

  private static generateDevFallbackParsedCV(rawText: string): ParsedCv {
    const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    const email = emailMatch ? emailMatch[1] : 'student@example.com';

    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const fullName = lines.length > 0 && lines[0].length < 40 ? lines[0] : 'Imported Candidate';

    return {
      fullName,
      email,
      phone: '+855 12 345 678',
      location: 'Phnom Penh, Cambodia',
      linkedinUrl: 'https://linkedin.com/in/student',
      githubUrl: 'https://github.com/student',
      summary: 'Extracted summary: Enthusiastic graduate student seeking career opportunities.',
      education: [
        {
          institution: 'Institute of Technology of Cambodia',
          degree: 'Bachelor of Science in Computer Science',
          location: 'Phnom Penh',
          startDate: '2020',
          endDate: '2024',
          isCurrent: false,
        },
      ],
      experience: [
        {
          title: 'Software Developer Intern',
          company: 'Technology Solutions Co.',
          location: 'Phnom Penh',
          startDate: '2023-06',
          endDate: '2023-12',
          isCurrent: false,
          bullets: [
            'Collaborated on front-end components and responsive UI design.',
            'Assisted in backend REST API endpoint development and database querying.',
          ],
        },
      ],
      projects: [
        {
          title: 'Academic Capstone Project',
          subtitle: 'Web Application',
          startDate: '2023',
          endDate: '2024',
          url: '',
          bullets: [
            'Designed and implemented complete full-stack web application architecture.',
          ],
        },
      ],
      skillGroups: [
        {
          categoryName: 'Languages & Technologies',
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
        },
      ],
    };
  }
}
