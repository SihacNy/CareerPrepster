import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { JobListQueryInput, UpdateRecommendationStatusInput, UpdateJobPreferencesInput } from '../schemas/jobs.schema.js';
import { JobQueueService } from '../services/job-queue.service.js';
import { JobDiscoveryService } from '../services/job-discovery.service.js';
import { JobMatchingService } from '../services/job-matching.service.js';

export class JobsController {
  /**
   * GET /api/jobs/recommendations
   */
  static async listRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const query = req.query as unknown as JobListQueryInput;

      // Check if user has recommendations. If not, evaluate initial matches automatically
      const existingCount = await prisma.jobMatchRecommendation.count({
        where: { userId },
      });

      if (existingCount === 0) {
        // Ensure there are at least some jobs in the database
        const jobCount = await prisma.jobListing.count();
        if (jobCount === 0) {
          const discovery = new JobDiscoveryService();
          await discovery.runDiscovery();
        }
        await JobMatchingService.evaluateUserMatches(userId);
      }

      // Build Prisma query filters
      const where: any = {
        userId,
      };

      if (query.status && query.status !== 'ALL') {
        where.status = query.status;
      }

      if (query.minScore && query.minScore > 0) {
        where.overallScore = { gte: query.minScore };
      }

      const jobWhere: any = { isActive: true };
      if (query.arrangement) {
        jobWhere.workArrangement = query.arrangement;
      }
      if (query.employmentType) {
        jobWhere.employmentType = query.employmentType;
      }
      if (query.search) {
        jobWhere.OR = [
          { title: { contains: query.search } },
          { company: { contains: query.search } },
          { location: { contains: query.search } },
        ];
      }

      where.jobListing = jobWhere;

      // Sorting
      let orderBy: any = { overallScore: 'desc' };
      if (query.sortBy === 'postedAt') {
        orderBy = { jobListing: { postedAt: query.sortOrder || 'desc' } };
      } else if (query.sortBy === 'discoveredAt') {
        orderBy = { jobListing: { discoveredAt: query.sortOrder || 'desc' } };
      } else {
        orderBy = { overallScore: query.sortOrder || 'desc' };
      }

      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      const skip = (page - 1) * limit;

      const [items, totalItems] = await Promise.all([
        prisma.jobMatchRecommendation.findMany({
          where,
          include: {
            jobListing: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.jobMatchRecommendation.count({ where }),
      ]);

      const formattedItems = items.map(rec => ({
        id: rec.id,
        overallScore: rec.overallScore,
        skillsScore: rec.skillsScore,
        experienceScore: rec.experienceScore,
        roleScore: rec.roleScore,
        preferenceScore: rec.preferenceScore,
        matchedSkills: rec.matchedSkills,
        missingSkills: rec.missingSkills,
        matchReasons: rec.matchReasons,
        status: rec.status,
        userNotes: rec.userNotes,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt,
        job: {
          id: rec.jobListing.id,
          title: rec.jobListing.title,
          company: rec.jobListing.company,
          logoUrl: rec.jobListing.logoUrl,
          location: rec.jobListing.location,
          workArrangement: rec.jobListing.workArrangement,
          employmentType: rec.jobListing.employmentType,
          description: rec.jobListing.description,
          requiredSkills: rec.jobListing.requiredSkills,
          preferredSkills: rec.jobListing.preferredSkills,
          minExperienceYears: rec.jobListing.minExperienceYears,
          sourcePlatform: rec.jobListing.sourcePlatform,
          externalId: rec.jobListing.externalId,
          applicationUrl: rec.jobListing.applicationUrl,
          postedAt: rec.jobListing.postedAt,
          discoveredAt: rec.jobListing.discoveredAt,
          isActive: rec.jobListing.isActive,
        },
      }));

      return res.status(200).json({
        success: true,
        data: {
          items: formattedItems,
          pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit) || 1,
            currentPage: page,
            pageSize: limit,
          },
          disclaimer: 'Match score reflects profile-to-requirement alignment and does not represent a hiring probability or guarantee.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jobs/recommendations/:id
   */
  static async getRecommendationById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const { id } = req.params;

      const rec = await prisma.jobMatchRecommendation.findFirst({
        where: { id, userId },
        include: { jobListing: true },
      });

      if (!rec) {
        throw new AppError('Job recommendation not found', 404, 'NOT_FOUND');
      }

      return res.status(200).json({
        success: true,
        data: {
          id: rec.id,
          overallScore: rec.overallScore,
          scores: {
            overall: rec.overallScore,
            skills: rec.skillsScore,
            experience: rec.experienceScore,
            role: rec.roleScore,
            preference: rec.preferenceScore,
          },
          matchedSkills: rec.matchedSkills,
          missingSkills: rec.missingSkills,
          matchReasons: rec.matchReasons,
          status: rec.status,
          userNotes: rec.userNotes,
          createdAt: rec.createdAt,
          updatedAt: rec.updatedAt,
          job: rec.jobListing,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/jobs/recommendations/:id/status
   */
  static async updateRecommendationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const { id } = req.params;
      const { status, userNotes } = req.body as UpdateRecommendationStatusInput;

      const existing = await prisma.jobMatchRecommendation.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError('Job recommendation not found', 404, 'NOT_FOUND');
      }

      const updated = await prisma.jobMatchRecommendation.update({
        where: { id },
        data: {
          status,
          ...(userNotes !== undefined ? { userNotes } : {}),
        },
      });

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jobs/preferences
   */
  static async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;

      let preference = await prisma.jobSearchPreference.findUnique({
        where: { userId },
      });

      if (!preference) {
        preference = await prisma.jobSearchPreference.create({
          data: {
            userId,
            desiredRoles: [],
            preferredLocations: ['Phnom Penh', 'Remote'],
            notifyDaily: true,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: preference,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/jobs/preferences
   */
  static async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const input = req.body as UpdateJobPreferencesInput;

      const updated = await prisma.jobSearchPreference.upsert({
        where: { userId },
        create: {
          userId,
          ...input,
        },
        update: {
          ...input,
        },
      });

      // Recalculate matches asynchronously with updated preferences
      JobQueueService.triggerUserRefresh(userId).catch(() => {});

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/jobs/refresh
   */
  static async triggerRefresh(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const result = await JobQueueService.triggerUserRefresh(userId);

      if (!result.success) {
        return res.status(429).json({
          success: false,
          error: result.message,
          retryAfterSeconds: result.cooldownSecondsRemaining,
        });
      }

      return res.status(202).json({
        success: true,
        message: result.message,
        data: {
          cooldownSecondsRemaining: result.cooldownSecondsRemaining,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jobs/refresh/status
   */
  static async getRefreshStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const status = JobQueueService.getRefreshCooldown(userId);

      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/jobs/admin/discover
   */
  static async adminDiscover(req: Request, res: Response, next: NextFunction) {
    try {
      const keywords = req.body.keywords || req.query.keywords?.toString();
      const location = req.body.location || req.query.location?.toString();

      const discovery = new JobDiscoveryService();
      const result = await discovery.runDiscovery({ keywords, location });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
