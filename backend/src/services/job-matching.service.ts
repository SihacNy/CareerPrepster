import { prisma } from '../config/prisma.js';
import { WorkArrangement, JobEmploymentType } from '@careerprepster/shared';
import { AIService } from './ai.service.js';

interface CandidateProfile {
  skills: string[];
  roleTitle?: string | null;
  experienceMonths: number;
  location?: string | null;
  preferredArrangement?: WorkArrangement | null;
  preferredEmploymentType?: JobEmploymentType | null;
  projects: string[];
  experiences: string[];
}

export class JobMatchingService {
  /**
   * Matches all active jobs for a specific user based on their primary/latest CV and preferences.
   */
  static async evaluateUserMatches(userId: string): Promise<number> {
    // 1. Find user's latest CV with sections and skill groups
    const cv = await prisma.cV.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        skillGroups: true,
        sections: {
          include: {
            items: {
              include: {
                bulletPoints: true,
              },
            },
          },
        },
      },
    });

    if (!cv) {
      console.warn(`[JobMatchingService] User ${userId} has no CV to evaluate matches against.`);
      return 0;
    }

    // 2. Fetch search preferences if any
    const preference = await prisma.jobSearchPreference.findUnique({
      where: { userId },
    });

    // 3. Extract candidate profile
    const profile = this.extractCandidateProfile(cv, preference);

    // 4. Fetch all active job listings
    const activeJobs = await prisma.jobListing.findMany({
      where: { isActive: true },
      take: 100, // Top 100 available vacancies
      orderBy: { postedAt: 'desc' },
    });

    let matchedCount = 0;

    for (const job of activeJobs) {
      const evaluation = this.calculateMatch(profile, job);

      // Enhance promising recommendations with Google Gemini AI semantic evaluation
      let finalMatchReasons: any = evaluation.matchReasons;
      if (evaluation.overallScore >= 50) {
        try {
          const aiReasons = await AIService.evaluateJobMatch({
            candidateProfile: profile,
            job: {
              title: job.title,
              company: job.company,
              description: job.description,
              requiredSkills: Array.isArray(job.requiredSkills) ? (job.requiredSkills as string[]) : [],
              workArrangement: job.workArrangement,
              location: job.location,
            },
          });
          if (aiReasons && aiReasons.summary) {
            finalMatchReasons = aiReasons;
          }
        } catch {
          // Gracefully fallback to deterministic reasons
        }
      }

      await prisma.jobMatchRecommendation.upsert({
        where: {
          userId_jobListingId: {
            userId,
            jobListingId: job.id,
          },
        },
        create: {
          userId,
          cvId: cv.id,
          jobListingId: job.id,
          overallScore: evaluation.overallScore,
          skillsScore: evaluation.skillsScore,
          experienceScore: evaluation.experienceScore,
          roleScore: evaluation.roleScore,
          preferenceScore: evaluation.preferenceScore,
          matchedSkills: evaluation.matchedSkills,
          missingSkills: evaluation.missingSkills,
          matchReasons: finalMatchReasons as any,
          status: 'ACTIVE',
        },
        update: {
          cvId: cv.id,
          overallScore: evaluation.overallScore,
          skillsScore: evaluation.skillsScore,
          experienceScore: evaluation.experienceScore,
          roleScore: evaluation.roleScore,
          preferenceScore: evaluation.preferenceScore,
          matchedSkills: evaluation.matchedSkills,
          missingSkills: evaluation.missingSkills,
          matchReasons: finalMatchReasons as any,
          updatedAt: new Date(),
        },
      });

      matchedCount++;
    }

    return matchedCount;
  }

  private static extractCandidateProfile(cv: any, preference: any): CandidateProfile {
    const skillsSet = new Set<string>();
    const projects: string[] = [];
    const experiences: string[] = [];

    // Add skills from skill groups
    if (Array.isArray(cv.skillGroups)) {
      for (const sg of cv.skillGroups) {
        if (Array.isArray(sg.skills)) {
          for (const s of sg.skills) {
            if (typeof s === 'string') skillsSet.add(s.trim());
          }
        }
      }
    }

    // Add skills and technologies mentioned in bullet points and items
    if (Array.isArray(cv.sections)) {
      for (const sec of cv.sections) {
        if (sec.sectionType === 'PROJECTS') {
          for (const item of sec.items || []) {
            projects.push(`${item.title}${item.subtitle ? ` (${item.subtitle})` : ''}`);
          }
        }
        if (sec.sectionType === 'EXPERIENCE') {
          for (const item of sec.items || []) {
            experiences.push(`${item.title}${item.subtitle ? ` at ${item.subtitle}` : ''}`);
          }
        }

        for (const item of sec.items || []) {
          if (item.title) skillsSet.add(item.title.trim());
          for (const bp of item.bulletPoints || []) {
            this.extractTechKeywords(bp.text).forEach(k => skillsSet.add(k));
          }
        }
      }
    }

    // Calculate approximate experience tenure
    let experienceMonths = 0;
    const expSection = cv.sections?.find((s: any) => s.sectionType === 'EXPERIENCE');
    if (expSection?.items?.length) {
      experienceMonths = expSection.items.length * 8; // Estimate ~8 months per listed role
    }

    // Role title
    const roleTitle = cv.targetRole?.title || cv.sections?.[0]?.items?.[0]?.title || null;

    return {
      skills: Array.from(skillsSet),
      roleTitle,
      experienceMonths,
      location: cv.location,
      preferredArrangement: preference?.preferredArrangement,
      preferredEmploymentType: preference?.preferredEmploymentType,
      projects,
      experiences,
    };
  }

  private static calculateMatch(profile: CandidateProfile, job: any) {
    const jobRequiredSkills: string[] = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
    const jobPreferredSkills: string[] = Array.isArray(job.preferredSkills) ? job.preferredSkills : [];

    const candidateSkillsLower = profile.skills.map(s => s.toLowerCase());

    // 1. Skill Match (40%)
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const reqSkill of jobRequiredSkills) {
      const lower = reqSkill.toLowerCase();
      const hasSkill = candidateSkillsLower.some(cs => cs === lower || cs.includes(lower) || lower.includes(cs));
      if (hasSkill) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    let skillsScore = 50;
    if (jobRequiredSkills.length > 0) {
      const ratio = matchedSkills.length / jobRequiredSkills.length;
      skillsScore = Math.min(100, Math.round(ratio * 90 + (matchedSkills.length > 0 ? 10 : 0)));
    }

    // 2. Role & Seniority Match (25%)
    let roleScore = 60;
    const lowerJobTitle = job.title.toLowerCase();
    if (profile.roleTitle) {
      const lowerCandidateTitle = profile.roleTitle.toLowerCase();
      if (lowerJobTitle.includes(lowerCandidateTitle) || lowerCandidateTitle.includes(lowerJobTitle)) {
        roleScore = 95;
      } else {
        const titleTokens = lowerCandidateTitle.split(/\s+/);
        const matches = titleTokens.filter(t => t.length > 2 && lowerJobTitle.includes(t));
        if (matches.length > 0) {
          roleScore = 80;
        }
      }
    }

    // 3. Experience Match (20%)
    let experienceScore = 75;
    const requiredYears = job.minExperienceYears || 0;
    const candidateYears = profile.experienceMonths / 12;
    if (candidateYears >= requiredYears) {
      experienceScore = 95;
    } else if (requiredYears - candidateYears <= 1) {
      experienceScore = 80;
    } else {
      experienceScore = 60;
    }

    // 4. Preferences Match (15%)
    let preferenceScore = 80;
    if (profile.preferredArrangement && profile.preferredArrangement === job.workArrangement) {
      preferenceScore = 100;
    } else if (job.workArrangement === 'REMOTE') {
      preferenceScore = 90;
    }

    // Composite Overall Score (0-100)
    const overallScore = Math.min(
      99,
      Math.max(
        35,
        Math.round(
          skillsScore * 0.40 +
          roleScore * 0.25 +
          experienceScore * 0.20 +
          preferenceScore * 0.15
        )
      )
    );

    // Structured Reasoning
    const evidenceReasons: string[] = [];
    if (matchedSkills.length > 0) {
      evidenceReasons.push(`Your CV demonstrates competency in key requirements: ${matchedSkills.slice(0, 3).join(', ')}.`);
    }
    if (roleScore >= 80) {
      evidenceReasons.push(`Your target role closely aligns with this ${job.title} vacancy.`);
    }
    if (job.workArrangement === 'REMOTE' || profile.preferredArrangement === job.workArrangement) {
      evidenceReasons.push(`Work arrangement (${job.workArrangement}) matches your preferred work style.`);
    }

    const skillGaps = missingSkills.slice(0, 3).map(skill => ({
      skill,
      criticality: 'MEDIUM' as const,
      recommendation: `Add verifiable project work or coursework covering ${skill} to strengthen your candidacy.`,
    }));

    const summary = overallScore >= 80
      ? `High profile alignment! Your technical background matches ${matchedSkills.length} core competencies for this role.`
      : overallScore >= 65
      ? `Solid match with transferable skills. Bridging ${missingSkills.slice(0, 2).join(' and ')} will enhance your profile.`
      : `Moderate potential. Consider building capstone projects addressing the requested requirements.`;

    return {
      overallScore,
      skillsScore,
      roleScore,
      experienceScore,
      preferenceScore,
      matchedSkills,
      missingSkills,
      matchReasons: {
        summary,
        evidenceReasons,
        skillGaps,
      },
    };
  }

  private static extractTechKeywords(text: string): string[] {
    if (!text) return [];
    const techWords = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Python',
      'Java', 'C#', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker',
      'AWS', 'Git', 'Next.js', 'Tailwind', 'HTML', 'CSS', 'REST'
    ];
    return techWords.filter(tw => new RegExp(`\\b${tw}\\b`, 'i').test(text));
  }
}
