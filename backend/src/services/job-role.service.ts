import { prisma } from '../config/prisma.js';
import { JobRoleQuery, RoleBulletsQuery } from '../schemas/job-role.schema.js';
import { AppError } from '../middlewares/errorHandler.js';

export class JobRoleService {
  static async listRoles(query: JobRoleQuery) {
    const where: any = { isActive: true };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q } },
        { description: { contains: query.q } },
      ];
    }

    if (query.industry) {
      where.industry = { equals: query.industry };
    }

    return prisma.jobRole.findMany({
      where,
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        industry: true,
        description: true,
        skills: true,
      },
    });
  }

  static async getRoleBullets(roleId: string, query: RoleBulletsQuery) {
    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AppError('Job role not found', 404, 'ROLE_NOT_FOUND');
    }

    const where: any = { jobRoleId: roleId };

    if (query.category) {
      where.skillCategory = { contains: query.category };
    }

    return prisma.roleBulletTemplate.findMany({
      where,
      orderBy: { skillCategory: 'asc' },
      select: {
        id: true,
        jobRoleId: true,
        bulletText: true,
        powerVerb: true,
        skillCategory: true,
        framework: true,
      },
    });
  }
}
