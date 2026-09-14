import { Request, Response, NextFunction } from 'express';
import { ATSService } from '../services/ats.service.js';

export class ATSController {
  static async scoreCv(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ATSService.scoreCv(req.user?.userId, req.body);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
