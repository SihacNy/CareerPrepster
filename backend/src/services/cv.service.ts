import { SectionType, BulletFramework } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { CreateCvInput, UpdateCvInput } from '../schemas/cv.schema.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class CvService {
  static async listUserCvs(userId: string) {
    logger.debug('CvService', `Listing CVs for user [${userId}]`);
    return prisma.cV.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        templateId: true,
        fullName: true,
        targetRoleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async createCv(userId: string, input: CreateCvInput) {
    logger.info('CvService', `Creating new CV for user [${userId}]`, { title: input.title, templateId: input.templateId });

    return prisma.$transaction(async (tx) => {
      const cv = await tx.cV.create({
        data: {
          userId,
          title: input.title || 'Untitled CV',
          templateId: input.templateId || 'classic-ats',
          targetRoleId: input.targetRoleId || null,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone || null,
          location: input.location || null,
          websiteUrl: input.websiteUrl || null,
          linkedinUrl: input.linkedinUrl || null,
          githubUrl: input.githubUrl || null,
          summary: input.summary || null,
          sections: {
            create: [
              { sectionType: SectionType.EDUCATION, customTitle: 'Education', orderIndex: 0 },
              { sectionType: SectionType.EXPERIENCE, customTitle: 'Work Experience', orderIndex: 1 },
              { sectionType: SectionType.PROJECTS, customTitle: 'Technical Projects', orderIndex: 2 },
              { sectionType: SectionType.SKILLS, customTitle: 'Technical Skills', orderIndex: 3 },
            ],
          },
          skillGroups: {
            create: [
              { categoryName: 'Languages & Frameworks', skills: [], orderIndex: 0 },
              { categoryName: 'Developer Tools', skills: [], orderIndex: 1 },
            ],
          },
        },
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
      });

      logger.info('CvService', `CV created with 4 default sections [ID: ${cv.id}]`);
      return cv;
    });
  }

  static async getCvById(cvId: string, userId: string) {
    logger.debug('CvService', `Fetching CV [ID: ${cvId}] for user [${userId}]`);

    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            items: {
              orderBy: { orderIndex: 'asc' },
              include: {
                bulletPoints: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
        skillGroups: {
          orderBy: { orderIndex: 'asc' },
        },
        atsReports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!cv) {
      logger.warn('CvService', `CV fetch failed: CV not found [ID: ${cvId}]`);
      throw new AppError('CV not found', 404, 'CV_NOT_FOUND');
    }

    if (cv.userId !== userId) {
      logger.warn('CvService', `Unauthorized CV access attempt: User [${userId}] tried accessing CV [${cvId}] owned by [${cv.userId}]`);
      throw new AppError('You do not have permission to access this CV', 403, 'FORBIDDEN');
    }

    return cv;
  }

  static async updateCv(cvId: string, userId: string, input: UpdateCvInput) {
    logger.info('CvService', `Atomic transaction update started for CV [ID: ${cvId}]`, {
      sectionCount: input.sections?.length,
      skillGroupCount: input.skillGroups?.length,
    });

    const existing = await prisma.cV.findUnique({
      where: { id: cvId },
    });

    if (!existing) {
      logger.warn('CvService', `CV update failed: CV not found [ID: ${cvId}]`);
      throw new AppError('CV not found', 404, 'CV_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      logger.warn('CvService', `Forbidden update: User [${userId}] does not own CV [${cvId}]`);
      throw new AppError('You do not have permission to modify this CV', 403, 'FORBIDDEN');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update root CV fields
      await tx.cV.update({
        where: { id: cvId },
        data: {
          title: input.title,
          templateId: input.templateId,
          targetRoleId: input.targetRoleId,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          location: input.location,
          websiteUrl: input.websiteUrl,
          linkedinUrl: input.linkedinUrl,
          githubUrl: input.githubUrl,
          summary: input.summary,
        },
      });

      // 2. Sync sections if provided
      if (input.sections) {
        const inputSectionIds = input.sections.map((s) => s.id).filter(Boolean) as string[];
        await tx.cVSection.deleteMany({
          where: {
            cvId,
            id: { notIn: inputSectionIds },
          },
        });

        for (const [secIdx, sec] of input.sections.entries()) {
          let sectionId = sec.id;

          if (sectionId) {
            await tx.cVSection.update({
              where: { id: sectionId },
              data: {
                sectionType: sec.sectionType as SectionType,
                customTitle: sec.customTitle,
                orderIndex: sec.orderIndex ?? secIdx,
                isVisible: sec.isVisible ?? true,
              },
            });
          } else {
            const newSec = await tx.cVSection.create({
              data: {
                cvId,
                sectionType: sec.sectionType as SectionType,
                customTitle: sec.customTitle,
                orderIndex: sec.orderIndex ?? secIdx,
                isVisible: sec.isVisible ?? true,
              },
            });
            sectionId = newSec.id;
          }

          // Sync items within section
          if (sec.items) {
            const inputItemIds = sec.items.map((i) => i.id).filter(Boolean) as string[];
            await tx.cVItem.deleteMany({
              where: {
                sectionId,
                id: { notIn: inputItemIds },
              },
            });

            for (const [itemIdx, item] of sec.items.entries()) {
              let itemId = item.id;

              if (itemId) {
                await tx.cVItem.update({
                  where: { id: itemId },
                  data: {
                    title: item.title,
                    subtitle: item.subtitle,
                    location: item.location,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    isCurrent: item.isCurrent ?? false,
                    url: item.url,
                    orderIndex: item.orderIndex ?? itemIdx,
                  },
                });
              } else {
                const newItem = await tx.cVItem.create({
                  data: {
                    sectionId,
                    title: item.title,
                    subtitle: item.subtitle,
                    location: item.location,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    isCurrent: item.isCurrent ?? false,
                    url: item.url,
                    orderIndex: item.orderIndex ?? itemIdx,
                  },
                });
                itemId = newItem.id;
              }

              // Sync bullets within item
              if (item.bulletPoints) {
                const inputBulletIds = item.bulletPoints.map((b) => b.id).filter(Boolean) as string[];
                await tx.bulletPoint.deleteMany({
                  where: {
                    itemId,
                    id: { notIn: inputBulletIds },
                  },
                });

                for (const [bIdx, bullet] of item.bulletPoints.entries()) {
                  if (bullet.id) {
                    await tx.bulletPoint.update({
                      where: { id: bullet.id },
                      data: {
                        text: bullet.text,
                        actionVerb: bullet.actionVerb,
                        hasMetric: bullet.hasMetric ?? false,
                        framework: (bullet.framework as BulletFramework) || BulletFramework.STANDARD,
                        orderIndex: bullet.orderIndex ?? bIdx,
                      },
                    });
                  } else {
                    await tx.bulletPoint.create({
                      data: {
                        itemId,
                        text: bullet.text,
                        actionVerb: bullet.actionVerb,
                        hasMetric: bullet.hasMetric ?? false,
                        framework: (bullet.framework as BulletFramework) || BulletFramework.STANDARD,
                        orderIndex: bullet.orderIndex ?? bIdx,
                      },
                    });
                  }
                }
              }
            }
          }
        }
      }

      // 3. Sync skill groups if provided
      if (input.skillGroups) {
        const inputSgIds = input.skillGroups.map((sg) => sg.id).filter(Boolean) as string[];
        await tx.skillGroup.deleteMany({
          where: {
            cvId,
            id: { notIn: inputSgIds },
          },
        });

        for (const [sgIdx, sg] of input.skillGroups.entries()) {
          if (sg.id) {
            await tx.skillGroup.update({
              where: { id: sg.id },
              data: {
                categoryName: sg.categoryName,
                skills: sg.skills,
                orderIndex: sg.orderIndex ?? sgIdx,
              },
            });
          } else {
            await tx.skillGroup.create({
              data: {
                cvId,
                categoryName: sg.categoryName,
                skills: sg.skills,
                orderIndex: sg.orderIndex ?? sgIdx,
              },
            });
          }
        }
      }

      logger.info('CvService', `CV [ID: ${cvId}] updated successfully`);

      return tx.cV.findUnique({
        where: { id: cvId },
        include: {
          sections: {
            orderBy: { orderIndex: 'asc' },
            include: {
              items: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  bulletPoints: {
                    orderBy: { orderIndex: 'asc' },
                  },
                },
              },
            },
          },
          skillGroups: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    });
  }

  static async deleteCv(cvId: string, userId: string) {
    logger.info('CvService', `Delete requested for CV [ID: ${cvId}] by user [${userId}]`);

    const existing = await prisma.cV.findUnique({
      where: { id: cvId },
    });

    if (!existing) {
      logger.warn('CvService', `Delete failed: CV not found [ID: ${cvId}]`);
      throw new AppError('CV not found', 404, 'CV_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      logger.warn('CvService', `Forbidden delete: User [${userId}] does not own CV [${cvId}]`);
      throw new AppError('You do not have permission to delete this CV', 403, 'FORBIDDEN');
    }

    await prisma.cV.delete({
      where: { id: cvId },
    });

    logger.info('CvService', `CV [ID: ${cvId}] and all nested children deleted`);
    return { message: 'CV deleted successfully' };
  }
}
