import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service.js';

export class AIController {
  static async enhanceBullet(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AIService.enhanceBullet(req.body);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
