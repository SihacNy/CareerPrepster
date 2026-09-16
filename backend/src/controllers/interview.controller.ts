import { Request, Response, NextFunction } from 'express';
import { InterviewService } from '../services/interview.service.js';

export class InterviewController {
  static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InterviewService.createSession(req.user!.userId, req.body);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getSessionById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await InterviewService.getSessionById(req.user!.userId, req.params.id);
      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InterviewService.submitAnswer(req.user!.userId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getScorecard(req: Request, res: Response, next: NextFunction) {
    try {
      const scorecard = await InterviewService.getOrGenerateScorecard(req.user!.userId, req.params.id);
      return res.status(200).json({
        success: true,
        data: scorecard,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InterviewService.listSessions(req.user!.userId, req.query as any);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
