import { prisma } from '../config/prisma.js';
import { ScoreCvInput, PillarFinding } from '../schemas/ats.schema.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

const POWER_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advised', 'analyzed', 'architected',
  'assembled', 'audited', 'authored', 'automated', 'balanced', 'boosted', 'built',
  'calculated', 'centralized', 'championed', 'clarified', 'coached', 'collaborated',
  'collected', 'communicated', 'composed', 'computed', 'conducted', 'configured',
  'consolidated', 'constructed', 'consulted', 'coordinated', 'crafted', 'created',
  'customized', 'debugged', 'decreased', 'delivered', 'deployed', 'designed',
  'developed', 'devised', 'diagnosed', 'directed', 'discovered', 'documented',
  'drafted', 'drove', 'eliminated', 'enabled', 'enforced', 'engineered', 'enhanced',
  'established', 'evaluated', 'examined', 'executed', 'expanded', 'expedited',
  'extracted', 'facilitated', 'formulated', 'founded', 'generated', 'guided',
  'handled', 'headed', 'identified', 'illustrated', 'implemented', 'improved',
  'increased', 'influenced', 'initiated', 'inspected', 'installed', 'instituted',
  'instructed', 'integrated', 'interpreted', 'interviewed', 'introduced', 'invented',
  'investigated', 'launched', 'led', 'leveraged', 'maintained', 'managed',
  'mapped', 'maximized', 'measured', 'mentored', 'migrated', 'minimized',
  'modeled', 'modernized', 'monitored', 'motivated', 'negotiated', 'obtained',
  'operated', 'optimized', 'orchestrated', 'organized', 'originated', 'overhauled',
  'oversaw', 'performed', 'piloted', 'pioneered', 'planned', 'prepared', 'presented',
  'produced', 'programmed', 'projected', 'promoted', 'proposed', 'provided',
  'published', 'quantified', 'realized', 'rebuilt', 'recommended', 'reconciled',
  'recorded', 'recruited', 'redesigned', 'reduced', 'refined', 'reformed',
  'regulated', 'rehabilitated', 'reinforced', 'reorganized', 'repaired', 'replaced',
  'reported', 'researched', 'resolved', 'restructured', 'retrieved', 'revamped',
  'reviewed', 'revitalized', 'saved', 'scaled', 'scheduled', 'screened', 'secured',
  'selected', 'separated', 'simplified', 'simulated', 'solved', 'spearheaded',
  'specialized', 'standardized', 'started', 'streamlined', 'strengthened', 'structured',
  'supervised', 'supplemented', 'surveyed', 'synthesized', 'systematized', 'targeted',
  'taught', 'tested', 'tracked', 'trained', 'transformed', 'translated', 'troubleshot',
  'unified', 'updated', 'upgraded', 'utilized', 'validated', 'verified', 'visualized',
  'wrote', 'yielded',
]);

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
  'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
  'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'will', 'can', 'must',
]);

export class ATSService {
  static async scoreCv(userId: string | undefined, input: ScoreCvInput) {
    let fullName = '';
    let email = '';
    let phone = '';
    let summary = '';
    let templateId = 'classic-ats';
    let sections: any[] = [];
    let skillGroups: any[] = [];

    if (input.cvId) {
      logger.debug('ATSService', `Scoring CV from database [ID: ${input.cvId}]`);
      const cv = await prisma.cV.findUnique({
        where: { id: input.cvId },
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

      if (!cv) {
        logger.warn('ATSService', `Scoring failed: CV not found [ID: ${input.cvId}]`);
        throw new AppError('CV not found', 404, 'CV_NOT_FOUND');
      }

      if (userId && cv.userId !== userId) {
        logger.warn('ATSService', `Forbidden scoring: User [${userId}] does not own CV [${input.cvId}]`);
        throw new AppError('You do not have permission to score this CV', 403, 'FORBIDDEN');
      }

      fullName = cv.fullName;
      email = cv.email;
      phone = cv.phone || '';
      summary = cv.summary || '';
      templateId = cv.templateId;
      sections = cv.sections;
      skillGroups = cv.skillGroups;
    } else if (input.cvData) {
      logger.debug('ATSService', 'Scoring live in-memory CV data directly from editor');
      const raw = input.cvData;
      fullName = raw.personalInfo?.fullName || raw.fullName || '';
      email = raw.personalInfo?.email || raw.email || '';
      phone = raw.personalInfo?.phone || raw.phone || '';
      summary = raw.personalInfo?.summary || raw.summary || '';
      templateId = raw.templateId || 'classic-ats';

      if (raw.sections) {
        sections = raw.sections;
      } else {
        sections = [
          {
            sectionType: 'EDUCATION',
            items: (raw.education || []).map((e: any) => ({
              title: e.degree || e.title || '',
              subtitle: e.institution || e.subtitle || '',
              bulletPoints: (e.bulletPoints || []).map((b: any) => ({
                text: typeof b === 'string' ? b : b.text,
              })),
            })),
          },
          {
            sectionType: 'EXPERIENCE',
            items: (raw.experience || []).map((e: any) => ({
              title: e.role || e.title || '',
              subtitle: e.company || e.subtitle || '',
              bulletPoints: (e.bulletPoints || []).map((b: any) => ({
                text: typeof b === 'string' ? b : b.text,
              })),
            })),
          },
          {
            sectionType: 'PROJECTS',
            items: (raw.projects || []).map((p: any) => ({
              title: p.name || p.title || '',
              subtitle: p.role || p.subtitle || '',
              bulletPoints: (p.bulletPoints || []).map((b: any) => ({
                text: typeof b === 'string' ? b : b.text,
              })),
            })),
          },
          {
            sectionType: 'SKILLS',
            items: [],
          },
        ];
      }

      if (raw.skillGroups) {
        skillGroups = raw.skillGroups;
      } else if (raw.skills) {
        skillGroups = raw.skills;
      }
    } else {
      throw new AppError('Either cvId or cvData must be provided for ATS scoring', 400, 'INVALID_INPUT');
    }

    const findings: PillarFinding[] = [];

    // 1. Parsability & Structure (Max 25 pts)
    let parsabilityScore = 0;
    if (fullName && fullName.trim().length > 2) {
      parsabilityScore += 5;
    } else {
      findings.push({
        id: 'parsability-name',
        pillar: 'PARSABILITY',
        severity: 'CRITICAL',
        title: 'Missing Full Name',
        message: 'Your CV lacks a clear full name at the top.',
        remediation: 'Enter your legal first and last name in the header.',
      });
    }

    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      parsabilityScore += 5;
      if (phone) parsabilityScore += 2;
      parsabilityScore += 1; // location present
    } else {
      findings.push({
        id: 'parsability-email',
        pillar: 'PARSABILITY',
        severity: 'CRITICAL',
        title: 'Missing or Invalid Email',
        message: 'Contact email is missing or formatted incorrectly.',
        remediation: 'Provide a valid professional email address.',
      });
    }

    const sectionTypes = new Set(sections.map((s) => s.sectionType));
    const hasEducation = sectionTypes.has('EDUCATION');
    const hasExperience = sectionTypes.has('EXPERIENCE');
    const hasSkills = sectionTypes.has('SKILLS') || skillGroups.length > 0;

    if (hasEducation && hasExperience && hasSkills) {
      parsabilityScore += 10;
      findings.push({
        id: 'parsability-sections-pass',
        pillar: 'PARSABILITY',
        severity: 'PASSED',
        title: 'Core Standard Sections Present',
        message: 'Education, Experience, and Skills sections are present and ATS parsable.',
      });
    } else {
      parsabilityScore += (hasEducation ? 3 : 0) + (hasExperience ? 4 : 0) + (hasSkills ? 3 : 0);
      findings.push({
        id: 'parsability-sections-warn',
        pillar: 'PARSABILITY',
        severity: 'CRITICAL',
        title: 'Missing Essential Section',
        message: `Missing: ${[!hasEducation && 'Education', !hasExperience && 'Experience', !hasSkills && 'Skills'].filter(Boolean).join(', ')}.`,
        remediation: 'Add standard resume sections so ATS parsers can categorize your profile.',
      });
    }

    if (templateId === 'classic-ats' || templateId === 'modern-compact' || templateId === 'classic' || templateId === 'modern') {
      parsabilityScore += 2;
    }
    parsabilityScore = Math.min(25, parsabilityScore);

    // 2. Impact & Action Phrasing (Max 30 pts)
    let impactScore = 0;
    const allBullets: string[] = [];

    sections.forEach((s) => {
      (s.items || []).forEach((item: any) => {
        (item.bulletPoints || []).forEach((b: any) => {
          const text = typeof b === 'string' ? b : b.text;
          if (text && text.trim().length > 0) {
            allBullets.push(text.trim());
          }
        });
      });
    });

    let powerVerbCount = 0;
    let metricCount = 0;
    const metricRegex = /(\d+[\.,]?\d*[%kKmMxXbB+]?|\$\d+|\d+\+|\b\d+\b)/;

    allBullets.forEach((bullet) => {
      const firstWord = bullet.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (POWER_VERBS.has(firstWord)) {
        powerVerbCount++;
      }
      if (metricRegex.test(bullet)) {
        metricCount++;
      }
    });

    const totalBullets = Math.max(1, allBullets.length);
    const powerVerbRatio = powerVerbCount / totalBullets;
    const metricRatio = metricCount / totalBullets;

    if (powerVerbRatio >= 0.75) {
      impactScore += 15;
      findings.push({
        id: 'impact-verbs-pass',
        pillar: 'IMPACT',
        severity: 'PASSED',
        title: 'Strong Action Power Verbs',
        message: `${Math.round(powerVerbRatio * 100)}% of bullets begin with decisive action verbs.`,
      });
    } else if (powerVerbRatio >= 0.4) {
      impactScore += 10;
      findings.push({
        id: 'impact-verbs-sug',
        pillar: 'IMPACT',
        severity: 'SUGGESTION',
        title: 'Strengthen Action Verbs',
        message: 'Some bullets start with passive phrasing. Begin every bullet with a strong power verb.',
        remediation: 'Use the AI Refine tool to rewrite bullets with verbs like Engineered, Spearheaded, or Delivered.',
      });
    } else {
      impactScore += 4;
      findings.push({
        id: 'impact-verbs-crit',
        pillar: 'IMPACT',
        severity: 'CRITICAL',
        title: 'Weak Action Phrasing',
        message: 'Most bullets do not start with recognized active power verbs.',
        remediation: 'Avoid phrases like "Responsible for" or "Assisted with". Start with active power verbs.',
      });
    }

    if (metricRatio >= 0.5) {
      impactScore += 15;
      findings.push({
        id: 'impact-metrics-pass',
        pillar: 'IMPACT',
        severity: 'PASSED',
        title: 'Quantified Impact Metrics',
        message: `${Math.round(metricRatio * 100)}% of bullets include numbers, percentages, or scale metrics.`,
      });
    } else if (metricRatio >= 0.25) {
      impactScore += 8;
      findings.push({
        id: 'impact-metrics-sug',
        pillar: 'IMPACT',
        severity: 'SUGGESTION',
        title: 'Add Quantifiable Results',
        message: 'Only a few bullets have numbers. Quantify your accomplishments with percentages or user counts.',
        remediation: 'Adopt the XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].',
      });
    } else {
      impactScore += 2;
      findings.push({
        id: 'impact-metrics-crit',
        pillar: 'IMPACT',
        severity: 'CRITICAL',
        title: 'Lack of Quantified Evidence',
        message: 'Your CV lacks metrics and quantifiable outcomes.',
        remediation: 'Add concrete numbers: time saved, latency reduced, users impacted, or test coverage %.',
      });
    }
    impactScore = Math.min(30, impactScore);

    // 3. Skills Depth & Categorization (Max 25 pts)
    let skillsScore = 0;
    const allSkills: string[] = [];

    skillGroups.forEach((sg) => {
      if (Array.isArray(sg.skills)) {
        sg.skills.forEach((s: any) => {
          if (typeof s === 'string' && s.trim()) allSkills.push(s.trim());
        });
      }
    });

    if (skillGroups.length >= 2) {
      skillsScore += 10;
      findings.push({
        id: 'skills-group-pass',
        pillar: 'SKILLS',
        severity: 'PASSED',
        title: 'Categorized Skill Groups',
        message: `Skills organized into ${skillGroups.length} clean categories.`,
      });
    } else if (skillGroups.length === 1) {
      skillsScore += 5;
      findings.push({
        id: 'skills-group-sug',
        pillar: 'SKILLS',
        severity: 'SUGGESTION',
        title: 'Group Skills into Categories',
        message: 'Organizing skills into groups (e.g. Languages, Frameworks, Tools) enhances ATS readability.',
      });
    } else {
      findings.push({
        id: 'skills-group-crit',
        pillar: 'SKILLS',
        severity: 'CRITICAL',
        title: 'No Skill Categories Defined',
        message: 'Add categorized skill groups to highlight your technical competencies.',
      });
    }

    const skillCount = allSkills.length;
    if (skillCount >= 8 && skillCount <= 25) {
      skillsScore += 15;
      findings.push({
        id: 'skills-count-pass',
        pillar: 'SKILLS',
        severity: 'PASSED',
        title: 'Optimal Skill Count',
        message: `${skillCount} skills listed (ideal range is 8–25).`,
      });
    } else if (skillCount > 25) {
      skillsScore += 8;
      findings.push({
        id: 'skills-count-high',
        pillar: 'SKILLS',
        severity: 'SUGGESTION',
        title: 'Keyword Stuffing Risk',
        message: `${skillCount} skills listed. Prune outdated or irrelevant skills to avoid looking unfocused.`,
      });
    } else if (skillCount > 0) {
      skillsScore += 6;
      findings.push({
        id: 'skills-count-low',
        pillar: 'SKILLS',
        severity: 'SUGGESTION',
        title: 'Add More Target Skills',
        message: `Only ${skillCount} skills listed. Aim for 8-15 core technologies matching your target job role.`,
      });
    } else {
      findings.push({
        id: 'skills-count-none',
        pillar: 'SKILLS',
        severity: 'CRITICAL',
        title: 'No Skills Listed',
        message: 'Your CV has zero skills entered.',
      });
    }
    skillsScore = Math.min(25, skillsScore);

    // 4. Brevity & Readability (Max 20 pts)
    let brevityScore = 0;

    const allText = [
      fullName,
      summary,
      ...allBullets,
      ...allSkills,
      ...sections.map((s) => s.customTitle || s.sectionType),
    ].join(' ');

    const wordCount = allText.split(/\s+/).filter(Boolean).length;

    if (wordCount >= 400 && wordCount <= 750) {
      brevityScore += 10;
      findings.push({
        id: 'brevity-words-pass',
        pillar: 'BREVITY',
        severity: 'PASSED',
        title: 'Optimal Resume Length',
        message: `CV word count (${wordCount} words) is within the ideal 1-page range (400–750 words).`,
      });
    } else if (wordCount < 400) {
      brevityScore += 5;
      findings.push({
        id: 'brevity-words-short',
        pillar: 'BREVITY',
        severity: 'SUGGESTION',
        title: 'Document is Thin',
        message: `Word count (${wordCount} words) is light. Add more details to your projects and experience.`,
      });
    } else {
      brevityScore += 5;
      findings.push({
        id: 'brevity-words-long',
        pillar: 'BREVITY',
        severity: 'SUGGESTION',
        title: 'Potential Multi-Page Spillover',
        message: `Word count (${wordCount} words) exceeds standard 1-page graduate length. Trim verbose bullets.`,
      });
    }

    const bulletLengths = allBullets.map((b) => b.split(/\s+/).length);
    const avgBulletLen =
      bulletLengths.length > 0
        ? Math.round(bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length)
        : 0;

    if (avgBulletLen >= 12 && avgBulletLen <= 28) {
      brevityScore += 10;
      findings.push({
        id: 'brevity-bullets-pass',
        pillar: 'BREVITY',
        severity: 'PASSED',
        title: 'Crisp Bullet Length',
        message: `Average bullet length is ${avgBulletLen} words (ideal is 12–28 words).`,
      });
    } else if (avgBulletLen < 12 && bulletLengths.length > 0) {
      brevityScore += 4;
      findings.push({
        id: 'brevity-bullets-short',
        pillar: 'BREVITY',
        severity: 'SUGGESTION',
        title: 'Bullets Too Short',
        message: `Average bullet is only ${avgBulletLen} words. Expand on what you accomplished and how.`,
      });
    } else if (avgBulletLen > 28) {
      brevityScore += 4;
      findings.push({
        id: 'brevity-bullets-long',
        pillar: 'BREVITY',
        severity: 'SUGGESTION',
        title: 'Run-On Bullets',
        message: `Average bullet is ${avgBulletLen} words. Break long sentences into punchy statements.`,
      });
    } else {
      brevityScore += 2;
    }
    brevityScore = Math.min(20, brevityScore);

    const overallScore = parsabilityScore + impactScore + skillsScore + brevityScore;

    // Optional Job Description Keyword Matcher
    let keywordAnalysis: any = undefined;
    let matchPercentage: number | null = null;

    if (input.targetJobDescription && input.targetJobDescription.trim().length > 20) {
      const jdTokens = input.targetJobDescription
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

      const uniqueJdKeywords = Array.from(new Set(jdTokens));
      const cvTextLower = allText.toLowerCase();

      const matchedKeywords: { keyword: string; count: number }[] = [];
      const missingKeywords: string[] = [];

      uniqueJdKeywords.forEach((kw) => {
        if (cvTextLower.includes(kw)) {
          matchedKeywords.push({ keyword: kw, count: (cvTextLower.match(new RegExp(kw, 'g')) || []).length });
        } else {
          missingKeywords.push(kw);
        }
      });

      matchPercentage =
        uniqueJdKeywords.length > 0
          ? Math.round((matchedKeywords.length / uniqueJdKeywords.length) * 100)
          : 0;

      keywordAnalysis = {
        matchPercentage,
        matchedKeywords: matchedKeywords.slice(0, 10),
        missingKeywords: missingKeywords.slice(0, 10),
      };
    }

    let reportId = `report-${Date.now()}`;

    // If cvId and userId exist in DB, save report
    if (input.cvId && userId) {
      try {
        const saved = await prisma.aTSReport.create({
          data: {
            cvId: input.cvId,
            userId,
            overallScore,
            parsabilityScore,
            impactScore,
            skillsScore,
            brevityScore,
            findings: findings as any,
            targetJobDesc: input.targetJobDescription || null,
            matchPercentage,
          },
        });
        reportId = saved.id;
      } catch (err: any) {
        logger.warn('ATSService', `Could not persist ATSReport: ${err.message}`);
      }
    }

    logger.info('ATSService', `Score calculated: ${overallScore}/100`, {
      parsability: `${parsabilityScore}/25`,
      impact: `${impactScore}/30`,
      skills: `${skillsScore}/25`,
      brevity: `${brevityScore}/20`,
      matchPercentage: matchPercentage ? `${matchPercentage}%` : 'N/A',
    });

    return {
      reportId,
      overallScore,
      wordCount,
      estimatedPages: Math.max(1, Math.ceil(wordCount / 500)),
      breakdown: {
        parsabilityScore,
        impactScore,
        skillsScore,
        brevityScore,
      },
      keywordAnalysis,
      findings: findings.map((f) => ({
        id: f.id,
        type: f.severity.toLowerCase(),
        pillar: f.pillar.toLowerCase(),
        message: f.message,
        recommendation: f.remediation || f.message,
      })),
    };
  }
}
