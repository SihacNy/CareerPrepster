import { JobDiscoveryService } from './job-discovery.service.js';
import { JobMatchingService } from './job-matching.service.js';
import { prisma } from '../config/prisma.js';

interface UserRefreshState {
  lastRefreshedAt: Date;
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export class JobQueueService {
  private static userRefreshMap = new Map<string, UserRefreshState>();
  private static isDiscoveryRunning = false;
  private static dailyTimer: NodeJS.Timeout | null = null;
  private static readonly COOLDOWN_SECONDS = 900; // 15 minutes cooldown

  /**
   * Initializes the scheduled daily background ingestion task at 02:00 Asia/Phnom_Penh.
   * Asia/Phnom_Penh is UTC+7, so 02:00 ICT is 19:00 UTC of the previous calendar day.
   */
  static initScheduler() {
    console.log('[JobQueueService] Initializing daily job discovery scheduler for 02:00 Asia/Phnom_Penh (UTC+7)');
    
    // Check every hour if we match 02:00 ICT
    this.dailyTimer = setInterval(() => {
      const now = new Date();
      // UTC+7 hours calculation
      const ictHours = (now.getUTCHours() + 7) % 24;
      const ictMinutes = now.getUTCMinutes();

      // Trigger if hour is 2 and minute is within the first 5 minutes of the hour
      if (ictHours === 2 && ictMinutes < 5 && !this.isDiscoveryRunning) {
        console.log('[JobQueueService] Triggering scheduled daily discovery cycle...');
        this.runDailyDiscovery().catch(err => {
          console.error('[JobQueueService] Daily discovery cycle failed:', err);
        });
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Runs the automated discovery and recalculates recommendations for all active users.
   */
  static async runDailyDiscovery() {
    if (this.isDiscoveryRunning) {
      console.warn('[JobQueueService] Discovery run already in progress. Skipping duplicate invocation.');
      return;
    }

    this.isDiscoveryRunning = true;
    try {
      const discovery = new JobDiscoveryService();
      const result = await discovery.runDiscovery();
      console.log(`[JobQueueService] Daily discovery finished: ${result.jobsInserted} new jobs, ${result.jobsUpdated} updated.`);

      // Recalculate matches for active users who have CVs
      const activeUsers = await prisma.user.findMany({
        where: { cvs: { some: {} } },
        select: { id: true },
        take: 100,
      });

      for (const user of activeUsers) {
        try {
          await JobMatchingService.evaluateUserMatches(user.id);
        } catch (err: any) {
          console.warn(`[JobQueueService] Failed to match for user ${user.id}: ${err.message}`);
        }
      }
    } finally {
      this.isDiscoveryRunning = false;
    }
  }

  /**
   * Checks whether a user is currently allowed to trigger a manual refresh.
   */
  static getRefreshCooldown(userId: string): { canRefresh: boolean; cooldownSecondsRemaining: number; status: string } {
    const state = this.userRefreshMap.get(userId);
    if (!state) {
      return { canRefresh: true, cooldownSecondsRemaining: 0, status: 'IDLE' };
    }

    const elapsedSeconds = Math.floor((Date.now() - state.lastRefreshedAt.getTime()) / 1000);
    const remaining = Math.max(0, this.COOLDOWN_SECONDS - elapsedSeconds);

    return {
      canRefresh: remaining === 0 && state.status !== 'PROCESSING',
      cooldownSecondsRemaining: remaining,
      status: state.status,
    };
  }

  /**
   * Triggers an asynchronous match recalculation for a user, enforcing the cooldown.
   */
  static async triggerUserRefresh(userId: string): Promise<{ success: boolean; message: string; cooldownSecondsRemaining: number }> {
    const { canRefresh, cooldownSecondsRemaining } = this.getRefreshCooldown(userId);

    if (!canRefresh) {
      return {
        success: false,
        message: `Please wait ${Math.ceil(cooldownSecondsRemaining / 60)} minutes before refreshing recommendations again.`,
        cooldownSecondsRemaining,
      };
    }

    // Set processing state
    this.userRefreshMap.set(userId, {
      lastRefreshedAt: new Date(),
      status: 'PROCESSING',
    });

    // Run asynchronously without blocking the caller HTTP request
    setImmediate(async () => {
      try {
        console.log(`[JobQueueService] Recalculating matches for user ${userId}...`);
        const count = await JobMatchingService.evaluateUserMatches(userId);
        console.log(`[JobQueueService] Recalculation complete for user ${userId} (${count} matches evaluated).`);

        this.userRefreshMap.set(userId, {
          lastRefreshedAt: new Date(),
          status: 'COMPLETED',
        });
      } catch (err: any) {
        console.error(`[JobQueueService] Recalculation failed for user ${userId}:`, err);
        this.userRefreshMap.set(userId, {
          lastRefreshedAt: new Date(),
          status: 'FAILED',
        });
      }
    });

    return {
      success: true,
      message: 'Job match recalculation started in the background.',
      cooldownSecondsRemaining: this.COOLDOWN_SECONDS,
    };
  }
}
