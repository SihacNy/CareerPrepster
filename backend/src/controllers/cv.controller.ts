import { Request, Response, NextFunction } from 'express';
import { CvService } from '../services/cv.service.js';

export class CvController {
  static async listUserCvs(req: Request, res: Response, next: NextFunction) {
    try {
      const cvs = await CvService.listUserCvs(req.user!.userId);
      return res.status(200).json({
        success: true,
        data: cvs,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createCv(req: Request, res: Response, next: NextFunction) {
    try {
      const cv = await CvService.createCv(req.user!.userId, req.body);
      return res.status(201).json({
        success: true,
        data: cv,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getCvById(req: Request, res: Response, next: NextFunction) {
    try {
      const cv = await CvService.getCvById(req.params.id, req.user!.userId);
      return res.status(200).json({
        success: true,
        data: cv,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateCv(req: Request, res: Response, next: NextFunction) {
    try {
      const cv = await CvService.updateCv(req.params.id, req.user!.userId, req.body);
      return res.status(200).json({
        success: true,
        data: cv,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCv(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CvService.deleteCv(req.params.id, req.user!.userId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
