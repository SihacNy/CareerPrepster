import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { JobSourceProvider, RawDiscoveredJob, JobDiscoveryQuery } from './providers/job-provider.interface.js';
import { LinkedInJobProvider } from './providers/linkedin.provider.js';
import { SeedJobProvider } from './providers/seed.provider.js';

export class JobDiscoveryService {
  private providers: JobSourceProvider[];

  constructor(providers?: JobSourceProvider[]) {
    this.providers = providers && providers.length > 0
      ? providers
      : [new LinkedInJobProvider(), new SeedJobProvider()];
  }

  /**
   * Generates a deterministic deduplication hash for a job posting.
   */
  static generateDedupHash(company: string, title: string, location: string): string {
    const normalized = `${company.trim().toLowerCase()}|${title.trim().toLowerCase()}|${location.trim().toLowerCase()}`;
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Runs the discovery and ingestion process across configured providers.
   */
  async runDiscovery(query?: JobDiscoveryQuery): Promise<{
    runId: string;
    jobsScanned: number;
    jobsInserted: number;
    jobsUpdated: number;
  }> {
    let totalScanned = 0;
    let totalInserted = 0;
    let totalUpdated = 0;

    const runRecord = await prisma.jobDiscoveryRun.create({
      data: {
        sourcePlatform: 'multi-provider',
        status: 'RUNNING',
      },
    });

    try {
      for (const provider of this.providers) {
        console.log(`[JobDiscoveryService] Querying provider: ${provider.displayName}`);
        let rawJobs: RawDiscoveredJob[] = [];

        try {
          rawJobs = await provider.discoverJobs(query);
        } catch (err: any) {
          console.warn(`[JobDiscoveryService] Error querying ${provider.displayName}: ${err.message}`);
          continue;
        }

        totalScanned += rawJobs.length;

        for (const job of rawJobs) {
          const dedupHash = JobDiscoveryService.generateDedupHash(job.company, job.title, job.location);

          const existing = await prisma.jobListing.findUnique({
            where: { dedupHash },
          });

          if (existing) {
            await prisma.jobListing.update({
              where: { id: existing.id },
              data: {
                lastSeenAt: new Date(),
                isActive: true,
                applicationUrl: job.applicationUrl || existing.applicationUrl,
                logoUrl: job.logoUrl || existing.logoUrl,
              },
            });
            totalUpdated++;
          } else {
            await prisma.jobListing.create({
              data: {
                title: job.title,
                company: job.company,
                logoUrl: job.logoUrl,
                location: job.location,
                workArrangement: job.workArrangement,
                employmentType: job.employmentType,
                description: job.description,
                requiredSkills: job.requiredSkills,
                preferredSkills: job.preferredSkills || [],
                minExperienceYears: job.minExperienceYears,
                sourcePlatform: job.sourcePlatform,
                externalId: job.externalId,
                applicationUrl: job.applicationUrl,
                dedupHash,
                isActive: true,
                postedAt: job.postedAt || new Date(),
              },
            });
            totalInserted++;
          }
        }
      }

      await prisma.jobDiscoveryRun.update({
        where: { id: runRecord.id },
        data: {
          status: 'SUCCEEDED',
          jobsScanned: totalScanned,
          jobsInserted: totalInserted,
          jobsUpdated: totalUpdated,
          completedAt: new Date(),
        },
      });

      return {
        runId: runRecord.id,
        jobsScanned: totalScanned,
        jobsInserted: totalInserted,
        jobsUpdated: totalUpdated,
      };
    } catch (error: any) {
      await prisma.jobDiscoveryRun.update({
        where: { id: runRecord.id },
        data: {
          status: 'FAILED',
          errorSummary: error.message || 'Unknown discovery error',
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
