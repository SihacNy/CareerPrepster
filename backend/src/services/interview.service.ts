import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';
import {
  CreateInterviewSessionInput,
  SubmitAnswerInput,
  ListSessionsQuery,
} from '../schemas/interview.schema.js';
import { InterviewAIService } from './interview-ai.service.js';

export class InterviewService {
  /**
   * Translates sessionLength enum to target question count
   */
  private static getTargetQuestionCount(length: 'QUICK' | 'STANDARD' | 'FULL'): number {
    switch (length) {
      case 'QUICK':
        return 3;
      case 'FULL':
        return 8;
      case 'STANDARD':
      default:
        return 5;
    }
  }

  /**
   * Create and initialize a new interview session
   */
  static async createSession(userId: string, input: CreateInterviewSessionInput) {
    logger.info('InterviewService', `Creating interview session for user ${userId}`, {
      track: input.track,
      length: input.sessionLength,
      cvId: input.cvId,
    });

    let cvContext = '';
    let targetRoleTitle = input.targetRoleTitle;

    // Ingest contextual CV if provided
    if (input.cvId) {
      const cv = await prisma.cV.findFirst({
        where: { id: input.cvId, userId },
        include: {
          targetRole: true,
          sections: {
            include: {
              items: {
                include: {
                  bulletPoints: true,
                },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
          skillGroups: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (cv) {
        cvContext = InterviewAIService.sanitizeCVContext(cv);
        if (!targetRoleTitle && cv.targetRole?.title) {
          targetRoleTitle = cv.targetRole.title;
        }
      }
    }

    // Fallback if role title still empty
    if (!targetRoleTitle) {
      targetRoleTitle = 'Software Engineer';
    }

    // Generate first question via AI service
    const initialQuestion = await InterviewAIService.generateInitialQuestion({
      cvContext,
      targetRoleTitle,
      jobDescription: input.jobDescription,
      track: input.track,
    });

    // Create session and question 1 in MySQL transaction
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.interviewSession.create({
        data: {
          userId,
          cvId: input.cvId || null,
          targetRoleId: input.targetRoleId || null,
          targetRoleTitle,
          jobDescription: input.jobDescription || null,
          track: input.track,
          sessionLength: input.sessionLength,
          mode: input.mode,
          status: 'IN_PROGRESS',
          currentQuestionIndex: 1,
        },
      });

      const question = await tx.interviewQuestion.create({
        data: {
          sessionId: session.id,
          questionIndex: 1,
          questionText: initialQuestion.questionText,
          competency: initialQuestion.competency,
          contextReference: initialQuestion.contextReference || null,
          isProbe: false,
        },
      });

      return { session, question };
    });

    const totalQuestions = this.getTargetQuestionCount(input.sessionLength);

    return {
      session: {
        id: result.session.id,
        userId: result.session.userId,
        cvId: result.session.cvId,
        targetRoleTitle: result.session.targetRoleTitle,
        track: result.session.track,
        sessionLength: result.session.sessionLength,
        mode: result.session.mode,
        status: result.session.status,
        currentQuestionIndex: 1,
        totalQuestions,
        startedAt: result.session.startedAt,
        firstQuestion: result.question,
      },
    };
  }

  /**
   * Get an interview session by ID with full questions, responses, feedback, and scorecard
   */
  static async getSessionById(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        questions: {
          include: {
            responses: {
              include: {
                feedback: true,
              },
            },
          },
          orderBy: [
            { questionIndex: 'asc' },
            { createdAt: 'asc' },
          ],
        },
        scorecard: true,
      },
    });

    if (!session) {
      throw new AppError('Interview session not found', 404, 'SESSION_NOT_FOUND');
    }

    const totalQuestions = this.getTargetQuestionCount(session.sessionLength as any);

    return {
      ...session,
      totalQuestions,
    };
  }

  /**
   * Submit an answer to the active question, handle adaptive probing and turn evaluations
   */
  static async submitAnswer(userId: string, sessionId: string, input: SubmitAnswerInput) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        cv: {
          include: {
            sections: {
              include: {
                items: {
                  include: {
                    bulletPoints: true,
                  },
                },
              },
            },
            skillGroups: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Interview session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new AppError('This interview session is already finished', 400, 'SESSION_ALREADY_COMPLETED');
    }

    const question = await prisma.interviewQuestion.findFirst({
      where: { id: input.questionId, sessionId },
      include: {
        responses: true,
      },
    });

    if (!question) {
      throw new AppError('Question not found in active session', 404, 'QUESTION_NOT_FOUND');
    }

    if (question.responses.length > 0) {
      throw new AppError('An answer has already been submitted for this question', 409, 'QUESTION_ALREADY_ANSWERED');
    }

    // Check if a follow-up probe already exists for this primary question
    const existingProbes = await prisma.interviewQuestion.findMany({
      where: {
        sessionId,
        parentQuestionId: question.isProbe ? question.parentQuestionId : question.id,
      },
    });

    const allowProbe = !question.isProbe && existingProbes.length === 0;
    const targetTotalQuestions = this.getTargetQuestionCount(session.sessionLength as any);
    const isFinalQuestion = question.questionIndex >= targetTotalQuestions;

    const wordCount = input.responseText.trim().split(/\s+/).filter(Boolean).length;

    // Persist response
    const response = await prisma.interviewResponse.create({
      data: {
        questionId: question.id,
        responseText: input.responseText.trim(),
        inputModality: input.inputModality,
        durationSeconds: input.durationSeconds,
        wordCount,
      },
    });

    const cvContext = session.cv ? InterviewAIService.sanitizeCVContext(session.cv) : undefined;

    // Evaluate response with AI service
    const evaluationResult = await InterviewAIService.evaluateTurnOrProbe({
      questionIndex: question.questionIndex,
      questionText: question.questionText,
      competency: question.competency,
      contextReference: question.contextReference,
      responseText: input.responseText,
      allowProbe,
      track: session.track,
      targetRoleTitle: session.targetRoleTitle,
      isFinalQuestion,
      cvContext,
    });

    // Case 1: Adaptive Probe Triggered
    if (evaluationResult.type === 'PROBE' && evaluationResult.probeQuestion) {
      const probeQuestion = await prisma.interviewQuestion.create({
        data: {
          sessionId,
          questionIndex: question.questionIndex,
          questionText: evaluationResult.probeQuestion.questionText,
          competency: evaluationResult.probeQuestion.competency,
          isProbe: true,
          parentQuestionId: question.id,
        },
      });

      return {
        type: 'PROBE' as const,
        questionId: question.id,
        probeQuestion,
      };
    }

    // Case 2: Standard Turn Evaluation
    const fb = evaluationResult.feedback!;
    const feedback = await prisma.turnFeedback.create({
      data: {
        responseId: response.id,
        starSituationScore: fb.starSituationScore,
        starSituationNotes: fb.starSituationNotes,
        starTaskScore: fb.starTaskScore,
        starTaskNotes: fb.starTaskNotes,
        starActionScore: fb.starActionScore,
        starActionNotes: fb.starActionNotes,
        starResultScore: fb.starResultScore,
        starResultNotes: fb.starResultNotes,
        impactScore: fb.impactScore,
        clarityScore: fb.clarityScore,
        powerVerbsUsed: fb.powerVerbsUsed,
        strengths: fb.strengths,
        improvements: fb.improvements,
        modelAnswer: fb.modelAnswer,
      },
    });

    // Check if session completed
    if (isFinalQuestion) {
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return {
        type: 'SESSION_COMPLETED' as const,
        questionId: question.id,
        feedback,
        sessionProgress: {
          currentQuestionIndex: targetTotalQuestions,
          totalQuestions: targetTotalQuestions,
          isComplete: true,
        },
        scorecardUrl: `/api/interviews/sessions/${sessionId}/scorecard`,
      };
    }

    // Advance to next question
    const nextQuestionIndex = question.questionIndex + 1;
    const nextQText = evaluationResult.nextQuestion?.questionText ||
      `Can you discuss a situation where you had to quickly learn a new technology or framework for a ${session.targetRoleTitle} task?`;
    const nextQComp = evaluationResult.nextQuestion?.competency || 'Learning Agility';

    const nextQuestion = await prisma.interviewQuestion.create({
      data: {
        sessionId,
        questionIndex: nextQuestionIndex,
        questionText: nextQText,
        competency: nextQComp,
        contextReference: evaluationResult.nextQuestion?.contextReference || null,
        isProbe: false,
      },
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        currentQuestionIndex: nextQuestionIndex,
      },
    });

    return {
      type: 'TURN_EVALUATION' as const,
      questionId: question.id,
      feedback,
      sessionProgress: {
        currentQuestionIndex: nextQuestionIndex,
        totalQuestions: targetTotalQuestions,
        isComplete: false,
      },
      nextQuestion,
    };
  }

  /**
   * Get or generate the final scorecard for a completed session
   */
  static async getOrGenerateScorecard(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        scorecard: true,
        cv: {
          include: {
            sections: {
              include: {
                items: {
                  include: {
                    bulletPoints: true,
                  },
                },
              },
            },
          },
        },
        questions: {
          include: {
            responses: {
              include: {
                feedback: true,
              },
            },
          },
          orderBy: { questionIndex: 'asc' },
        },
      },
    });

    if (!session) {
      throw new AppError('Interview session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Return cached scorecard if already computed
    if (session.scorecard) {
      return session.scorecard;
    }

    // Aggregate answered turns
    const turns = session.questions.flatMap((q) =>
      q.responses.map((r) => ({
        questionText: q.questionText,
        competency: q.competency,
        responseText: r.responseText,
        feedback: r.feedback,
      }))
    );

    if (turns.length === 0) {
      throw new AppError('No responses recorded for this session yet', 400, 'NO_RESPONSES');
    }

    // Extract CV bullet points if CV was attached
    const cvBullets: Array<{ id: string; itemId: string; text: string; itemTitle?: string }> = [];
    if (session.cv) {
      for (const sec of session.cv.sections) {
        for (const item of sec.items) {
          for (const bp of item.bulletPoints) {
            cvBullets.push({
              id: bp.id,
              itemId: item.id,
              text: bp.text,
              itemTitle: item.title,
            });
          }
        }
      }
    }

    // Synthesize scorecard with AI
    const synthesis = await InterviewAIService.synthesizeScorecard({
      targetRoleTitle: session.targetRoleTitle,
      track: session.track,
      turns,
      cvBullets,
    });

    // Save scorecard and update session score
    const scorecard = await prisma.$transaction(async (tx) => {
      const sc = await tx.interviewScorecard.create({
        data: {
          sessionId,
          overallScore: synthesis.overallScore,
          readinessTier: synthesis.readinessTier,
          starScore: synthesis.starScore,
          technicalScore: synthesis.technicalScore,
          communicationScore: synthesis.communicationScore,
          impactScore: synthesis.impactScore,
          keyStrengths: synthesis.keyStrengths,
          keyGrowthAreas: synthesis.keyGrowthAreas,
          cvRecommendations: synthesis.cvRecommendations,
        },
      });

      await tx.interviewSession.update({
        where: { id: sessionId },
        data: {
          overallScore: synthesis.overallScore,
          status: 'COMPLETED',
          completedAt: session.completedAt || new Date(),
        },
      });

      return sc;
    });

    return scorecard;
  }

  /**
   * List past interview sessions with pagination and filtering
   */
  static async listSessions(userId: string, query: ListSessionsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.track) {
      where.track = query.track;
    }

    const [total, sessions] = await Promise.all([
      prisma.interviewSession.count({ where }),
      prisma.interviewSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          _count: {
            select: { questions: true },
          },
        },
      }),
    ]);

    const mappedSessions = sessions.map((s) => ({
      id: s.id,
      targetRoleTitle: s.targetRoleTitle,
      track: s.track,
      sessionLength: s.sessionLength,
      mode: s.mode,
      status: s.status,
      overallScore: s.overallScore,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      questionCount: s._count.questions,
    }));

    return {
      sessions: mappedSessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
