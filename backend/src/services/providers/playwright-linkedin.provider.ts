import { chromium, Browser, BrowserContext } from 'playwright';
import { JobSourceProvider, RawDiscoveredJob, JobDiscoveryQuery } from './job-provider.interface.js';

export class PlaywrightLinkedInProvider implements JobSourceProvider {
  readonly sourceId = 'linkedin-playwright';
  readonly displayName = 'LinkedIn (Playwright)';

  private readonly COMMON_TECH_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
    'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI',
    'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Go', 'Rust',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Git',
    'Tailwind CSS', 'GraphQL', 'REST API', 'HTML', 'CSS'
  ];

  async discoverJobs(query?: JobDiscoveryQuery): Promise<RawDiscoveredJob[]> {
    const keywords = query?.keywords || 'Software Engineer';
    const location = query?.location || 'Remote';
    const limit = query?.limit || 15;

    let browser: Browser | null = null;
    let context: BrowserContext | null = null;

    try {
      console.log(`[PlaywrightLinkedInProvider] Launching headless browser for: "${keywords}" in "${location}"...`);
      browser = await this.launchBrowser();

      context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'en-US',
      });

      const page = await context.newPage();

      // Stealth evasion to bypass navigator.webdriver detection
      await page.addInitScript('Object.defineProperty(navigator, "webdriver", { get: () => undefined })');

      const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&sortBy=DD`;
      console.log(`[PlaywrightLinkedInProvider] Navigating to: ${searchUrl}`);

      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait a moment for dynamic job items to mount
      await page.waitForTimeout(1500);

      // Dismiss potential sign-in modals if present
      try {
        const dismissBtn = await page.$(
          'button.contextual-sign-in-modal__modal-dismiss-btn, button.artdeco-modal__dismiss, [data-tracking-control-name="public_jobs_contextual-sign-in-modal_modal_dismiss"]'
        );
        if (dismissBtn) {
          await dismissBtn.click();
          await page.waitForTimeout(500);
        }
      } catch {
        // Ignore modal dismissal failures
      }

      // Scroll page dynamically to trigger lazy-loaded listings
      await page.evaluate('window.scrollBy(0, 1200)');
      await page.waitForTimeout(1500);

      // Extract job cards directly from the live DOM
      const rawCards = await page.$$eval(
        'ul.jobs-search__results-list li, .base-card, .job-search-card',
        (cards, max) => {
          const results: Array<{
            title: string;
            company: string;
            location: string;
            logoUrl: string | null;
            applicationUrl: string;
            externalId: string | null;
            rawSnippet: string;
          }> = [];

          for (const card of cards) {
            if (results.length >= max) break;

            const titleEl = card.querySelector('.base-search-card__title, h3');
            const title = titleEl?.textContent?.trim() || '';
            if (!title) continue;

            const companyEl = card.querySelector('.base-search-card__subtitle, h4, .hidden-nested-link');
            const company = companyEl?.textContent?.trim() || 'Confidential Employer';

            const locationEl = card.querySelector('.job-search-card__location, .job-result-card__location');
            const location = locationEl?.textContent?.trim() || 'Remote';

            const logoEl = card.querySelector('img.artdeco-entity-image, img');
            const logoUrl = logoEl?.getAttribute('data-delayed-url') || logoEl?.getAttribute('src') || null;

            const linkEl = card.querySelector('a.base-card__full-link, a.base-search-card--link, a');
            let applicationUrl = linkEl?.getAttribute('href') || '';
            if (applicationUrl) {
              try {
                const u = new URL(applicationUrl);
                applicationUrl = `${u.origin}${u.pathname}`;
              } catch {
                // Keep raw link
              }
            }

            const urn = card.getAttribute('data-entity-urn');
            const externalId = urn ? urn.replace(/\D/g, '') : null;

            const snippet = card.textContent || '';

            results.push({
              title,
              company,
              location,
              logoUrl: logoUrl && !logoUrl.includes('ghost-company') ? logoUrl : null,
              applicationUrl: applicationUrl || `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(title)}`,
              externalId,
              rawSnippet: snippet,
            });
          }

          return results;
        },
        limit
      );

      console.log(`[PlaywrightLinkedInProvider] Extracted ${rawCards.length} live cards from browser session.`);

      const jobs: RawDiscoveredJob[] = rawCards.map(item => {
        const lowerLoc = item.location.toLowerCase();
        const lowerTitle = item.title.toLowerCase();

        // Work arrangement heuristic
        let workArrangement: 'REMOTE' | 'HYBRID' | 'ON_SITE' = 'ON_SITE';
        if (lowerLoc.includes('remote') || lowerTitle.includes('remote')) {
          workArrangement = 'REMOTE';
        } else if (lowerLoc.includes('hybrid') || lowerTitle.includes('hybrid')) {
          workArrangement = 'HYBRID';
        }

        // Employment type heuristic
        let employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' = 'FULL_TIME';
        if (lowerTitle.includes('intern') || lowerTitle.includes('internship') || lowerTitle.includes('co-op')) {
          employmentType = 'INTERNSHIP';
        } else if (lowerTitle.includes('contract') || lowerTitle.includes('freelance')) {
          employmentType = 'CONTRACT';
        } else if (lowerTitle.includes('part-time') || lowerTitle.includes('part time')) {
          employmentType = 'PART_TIME';
        }

        // Skill extraction from title and snippet
        const fullText = `${item.title} ${item.rawSnippet}`;
        const requiredSkills = this.COMMON_TECH_SKILLS.filter(skill => {
          const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return regex.test(fullText);
        });

        if (requiredSkills.length === 0) {
          if (lowerTitle.includes('front') || lowerTitle.includes('react') || lowerTitle.includes('web')) {
            requiredSkills.push('React', 'TypeScript', 'HTML/CSS');
          } else if (lowerTitle.includes('back') || lowerTitle.includes('node') || lowerTitle.includes('api')) {
            requiredSkills.push('Node.js', 'Express', 'SQL');
          } else if (lowerTitle.includes('data') || lowerTitle.includes('ai') || lowerTitle.includes('python')) {
            requiredSkills.push('Python', 'SQL');
          } else {
            requiredSkills.push('JavaScript', 'Git');
          }
        }

        return {
          title: item.title,
          company: item.company,
          logoUrl: item.logoUrl,
          location: item.location,
          workArrangement,
          employmentType,
          description: `Live position for ${item.title} at ${item.company} (${item.location}). Scraped directly via Playwright browser session. View full job specifications at application link.`,
          requiredSkills,
          minExperienceYears: lowerTitle.includes('senior') ? 4 : lowerTitle.includes('junior') || lowerTitle.includes('intern') ? 0 : 2,
          sourcePlatform: this.sourceId,
          externalId: item.externalId,
          applicationUrl: item.applicationUrl,
          postedAt: new Date(),
        };
      });

      return jobs;
    } catch (err: any) {
      console.warn(`[PlaywrightLinkedInProvider] Headless scraping failed (${err.message}). Gracefully delegating to fallback provider.`);
      return [];
    } finally {
      if (context) await context.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    }
  }

  private async launchBrowser(): Promise<Browser> {
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ];

    // Priority 1: System installed Google Chrome
    try {
      return await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: launchArgs,
      });
    } catch {
      // Priority 2: System installed Microsoft Edge (Windows standard)
      try {
        return await chromium.launch({
          channel: 'msedge',
          headless: true,
          args: launchArgs,
        });
      } catch {
        // Priority 3: Bundled Chromium
        return await chromium.launch({
          headless: true,
          args: launchArgs,
        });
      }
    }
  }
}
