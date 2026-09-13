import { Request, Response, NextFunction } from 'express';
import { JobRoleService } from '../services/job-role.service.js';

export class JobRoleController {
  static async listRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await JobRoleService.listRoles(req.query as any);
      return res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getRoleBullets(req: Request, res: Response, next: NextFunction) {
    try {
      const bullets = await JobRoleService.getRoleBullets(req.params.id, req.query as any);
      return res.status(200).json({
        success: true,
        data: bullets,
      });
    } catch (error) {
      return next(error);
    }
  }
}
