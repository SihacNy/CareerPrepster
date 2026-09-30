import { JobSourceProvider, RawDiscoveredJob, JobDiscoveryQuery } from './job-provider.interface.js';

export class LinkedInJobProvider implements JobSourceProvider {
  readonly sourceId = 'linkedin';
  readonly displayName = 'LinkedIn';

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

    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&start=0`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.warn(`[LinkedInJobProvider] LinkedIn public endpoint responded with status ${response.status}`);
        return [];
      }

      const html = await response.text();
      return this.parseLinkedInHtml(html, limit);
    } catch (err: any) {
      console.warn(`[LinkedInJobProvider] Failed to fetch LinkedIn jobs (${err.message}). Falling back gracefully.`);
      return [];
    }
  }

  private parseLinkedInHtml(html: string, limit: number): RawDiscoveredJob[] {
    const jobs: RawDiscoveredJob[] = [];
    
    // Split by list items or base-card elements
    const cardBlocks = html.split(/<li\b[^>]*>/gi).slice(1);

    for (const block of cardBlocks) {
      if (jobs.length >= limit) break;

      // Extract Title
      const titleMatch = block.match(/<h3\b[^>]*class=["'][^"']*base-search-card__title[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i);
      const title = titleMatch ? this.cleanText(titleMatch[1]) : '';
      if (!title) continue;

      // Extract Company
      const companyMatch = 
        block.match(/<h4\b[^>]*class=["'][^"']*base-search-card__subtitle[^"']*["'][^>]*>([\s\S]*?)<\/h4>/i) ||
        block.match(/<a\b[^>]*class=["'][^"']*hidden-nested-link[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
      const company = companyMatch ? this.cleanText(companyMatch[1]) : 'Confidential Employer';

      // Extract Location
      const locationMatch = block.match(/<span\b[^>]*class=["'][^"']*job-search-card__location[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
      const location = locationMatch ? this.cleanText(locationMatch[1]) : 'Remote';

      // Extract Logo URL
      let logoUrl: string | null = null;
      const logoMatch = 
        block.match(/data-delayed-url=["']([^"']+)["']/i) ||
        block.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*(?:artdeco-entity-image|job-search-card)[^"']*["']/i);
      if (logoMatch && logoMatch[1] && !logoMatch[1].includes('ghost-company')) {
        logoUrl = this.unescapeHtml(logoMatch[1]);
      }

      // Extract Application / View URL
      const linkMatch = block.match(/<a\b[^>]*class=["'][^"']*base-card__full-link[^"']*["'][^>]*href=["']([^"']+)["']/i);
      let applicationUrl = linkMatch ? this.unescapeHtml(linkMatch[1]) : '';
      if (applicationUrl) {
        // Strip tracking params for clean canonical navigation
        try {
          const parsed = new URL(applicationUrl);
          applicationUrl = `${parsed.origin}${parsed.pathname}`;
        } catch {
          // Keep as is if unparseable
        }
      } else {
        applicationUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}`;
      }

      // Extract external ID
      const urnMatch = block.match(/data-entity-urn=["']urn:li:jobPosting:(\d+)["']/i);
      const externalId = urnMatch ? urnMatch[1] : null;

      // Determine Work Arrangement
      const lowerLoc = location.toLowerCase();
      const lowerTitle = title.toLowerCase();
      let workArrangement: 'REMOTE' | 'HYBRID' | 'ON_SITE' = 'ON_SITE';
      if (lowerLoc.includes('remote') || lowerTitle.includes('remote')) {
        workArrangement = 'REMOTE';
      } else if (lowerLoc.includes('hybrid') || lowerTitle.includes('hybrid')) {
        workArrangement = 'HYBRID';
      }

      // Determine Employment Type
      let employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' = 'FULL_TIME';
      if (lowerTitle.includes('intern') || lowerTitle.includes('internship') || lowerTitle.includes('co-op')) {
        employmentType = 'INTERNSHIP';
      } else if (lowerTitle.includes('contract') || lowerTitle.includes('freelance')) {
        employmentType = 'CONTRACT';
      } else if (lowerTitle.includes('part-time') || lowerTitle.includes('part time')) {
        employmentType = 'PART_TIME';
      }

      // Extract Skills found in title and surrounding text
      const fullText = `${title} ${block}`;
      const requiredSkills = this.COMMON_TECH_SKILLS.filter(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(fullText);
      });

      // If no tech skills matched, provide default core skills for the role
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

      jobs.push({
        title,
        company,
        logoUrl,
        location,
        workArrangement,
        employmentType,
        description: `Position for ${title} at ${company} located in ${location}. Apply directly via the LinkedIn listing for full requirements and company information.`,
        requiredSkills,
        minExperienceYears: lowerTitle.includes('senior') ? 4 : lowerTitle.includes('junior') || lowerTitle.includes('intern') ? 0 : 2,
        sourcePlatform: this.sourceId,
        externalId,
        applicationUrl,
        postedAt: new Date(),
      });
    }

    return jobs;
  }

  private cleanText(str: string): string {
    return str
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private unescapeHtml(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}
