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

const CANONICAL_SKILLS: Record<string, string> = {
  // Programming & Scripting Languages
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  'c++': 'C++',
  cpp: 'C++',
  'c#': 'C#',
  csharp: 'C#',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  nosql: 'NoSQL',
  html: 'HTML5',
  html5: 'HTML5',
  css: 'CSS3',
  css3: 'CSS3',
  sass: 'Sass',
  scss: 'SCSS',
  bash: 'Bash Scripting',
  shell: 'Shell Scripting',
  dart: 'Dart',
  r: 'R',
  scala: 'Scala',

  // Frontend Frameworks & Libraries
  react: 'React',
  'react.js': 'React',
  reactjs: 'React',
  'react native': 'React Native',
  flutter: 'Flutter',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  vue: 'Vue.js',
  'vue.js': 'Vue.js',
  vuejs: 'Vue.js',
  angular: 'Angular',
  svelte: 'Svelte',
  'tailwind css': 'Tailwind CSS',
  tailwind: 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  'material ui': 'Material UI',
  mui: 'Material UI',
  redux: 'Redux',
  zustand: 'Zustand',
  webpack: 'Webpack',
  vite: 'Vite',

  // Backend, APIs & Frameworks
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  node: 'Node.js',
  express: 'Express',
  'express.js': 'Express',
  nestjs: 'NestJS',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  'spring boot': 'Spring Boot',
  spring: 'Spring Boot',
  laravel: 'Laravel',
  '.net': '.NET',
  dotnet: '.NET',
  'asp.net': 'ASP.NET',
  graphql: 'GraphQL',
  'rest apis': 'REST APIs',
  'rest api': 'REST APIs',
  rest: 'REST APIs',
  restful: 'REST APIs',
  api: 'REST APIs',
  apis: 'REST APIs',
  devops: 'DevOps',
  grpc: 'gRPC',
  websockets: 'WebSockets',
  microservices: 'Microservices',

  // Databases, Caching & ORMs
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  redis: 'Redis',
  sqlite: 'SQLite',
  prisma: 'Prisma',
  typeorm: 'TypeORM',
  mongoose: 'Mongoose',
  dynamodb: 'DynamoDB',
  firebase: 'Firebase',
  supabase: 'Supabase',
  elasticsearch: 'Elasticsearch',
  oracle: 'Oracle',
  mariadb: 'MariaDB',
  cassandra: 'Cassandra',
  neo4j: 'Neo4j',
  bigquery: 'BigQuery',
  snowflake: 'Snowflake',

  // Cloud, DevOps & Infrastructure
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  gcp: 'GCP',
  'google cloud': 'GCP',
  azure: 'Azure',
  terraform: 'Terraform',
  ansible: 'Ansible',
  'ci/cd': 'CI/CD',
  cicd: 'CI/CD',
  'github actions': 'GitHub Actions',
  jenkins: 'Jenkins',
  gitlab: 'GitLab',
  git: 'Git',
  github: 'GitHub',
  linux: 'Linux',
  nginx: 'Nginx',
  apache: 'Apache',
  prometheus: 'Prometheus',
  grafana: 'Grafana',

  // Testing & Quality Assurance
  jest: 'Jest',
  cypress: 'Cypress',
  playwright: 'Playwright',
  selenium: 'Selenium',
  postman: 'Postman',
  supertest: 'Supertest',
  'unit testing': 'Unit Testing',
  'e2e testing': 'E2E Testing',
  tdd: 'TDD',

  // Data Science, ML & Analytics
  pandas: 'Pandas',
  numpy: 'NumPy',
  'scikit-learn': 'Scikit-Learn',
  tensorflow: 'TensorFlow',
  pytorch: 'PyTorch',
  keras: 'Keras',
  'hugging face': 'Hugging Face',
  opencv: 'OpenCV',
  spark: 'Apache Spark',
  'apache spark': 'Apache Spark',
  airflow: 'Airflow',
  kafka: 'Kafka',
  'power bi': 'Power BI',
  powerbi: 'Power BI',
  tableau: 'Tableau',
  excel: 'Excel',
  'machine learning': 'Machine Learning',
  'deep learning': 'Deep Learning',
  nlp: 'Natural Language Processing',

  // Design, Security & Methodologies
  figma: 'Figma',
  jira: 'Jira',
  confluence: 'Confluence',
  agile: 'Agile/Scrum',
  scrum: 'Agile/Scrum',
  kanban: 'Kanban',
  siem: 'SIEM',
  wireshark: 'Wireshark',
  owasp: 'OWASP Top 10',
  'penetration testing': 'Penetration Testing',
  'active directory': 'Active Directory',
  'system design': 'System Design',
  'user research': 'User Research',
  wireframing: 'Wireframing',
  prototyping: 'Prototyping',
  'design systems': 'Design Systems',
};

const JOB_JARGON_BLACKLIST = new Set([
  // General English words & Job Posting boilerplate
  'database', 'databases', 'management', 'manage', 'manager', 'managers', 'managing', 'managed',
  'design', 'designs', 'designer', 'designers', 'designing', 'designed',
  'logic', 'server', 'servers', 'looking', 'senior', 'junior', 'lead', 'staff', 'principal',
  'strong', 'proficient', 'proficiency', 'experience', 'experienced', 'seeking', 'responsibilities',
  'responsibility', 'qualifications', 'qualification', 'requirements', 'requirement', 'skill', 'skills',
  'ability', 'abilities', 'capable', 'competencies', 'competency', 'knowledge', 'understanding',
  'years', 'year', 'work', 'working', 'worker', 'team', 'teams', 'teamwork', 'player', 'players',
  'member', 'members', 'candidate', 'candidates', 'applicant', 'applicants', 'role', 'roles',
  'position', 'positions', 'job', 'jobs', 'developer', 'developers', 'engineer', 'engineers',
  'engineering', 'building', 'build', 'builds', 'develop', 'developing', 'development', 'deliver',
  'delivering', 'delivery', 'maintain', 'maintaining', 'maintenance', 'maintained', 'solutions',
  'solution', 'products', 'product', 'features', 'feature', 'projects', 'project', 'practices',
  'practice', 'standards', 'standard', 'environment', 'production', 'support', 'supporting',
  'written', 'verbal', 'communication', 'problem', 'solving', 'fast', 'paced', 'fast-paced',
  'cross', 'functional', 'cross-functional', 'business', 'stakeholders', 'stakeholder', 'users',
  'user', 'clients', 'client', 'customer', 'customers', 'internal', 'external', 'opportunity',
  'opportunities', 'apply', 'applying', 'location', 'salary', 'benefits', 'compensation', 'equal',
  'employer', 'must', 'have', 'including', 'includes', 'include', 'plus', 'hands', 'hand', 'hands-on',
  'ideal', 'degree', 'computer', 'science', 'related', 'field', 'fields', 'overview', 'summary',
  'status', 'flexible', 'remote', 'hybrid', 'office', 'level', 'track', 'success', 'demonstrated',
  'proven', 'effective', 'collaborate', 'collaborating', 'collaboration', 'collaborative', 'ensure',
  'ensuring', 'participate', 'participating', 'help', 'helping', 'guide', 'guidelines', 'best',
  'excellent', 'good', 'great', 'high', 'quality', 'clean', 'modern', 'scalable', 'secure',
  'reliable', 'day', 'daily', 'tasks', 'task', 'needs', 'drive', 'driving', 'focus', 'focused',
  'passion', 'passionate', 'growth', 'learning', 'self', 'starter', 'stack', 'tech', 'technical',
  'technology', 'technologies', 'tools', 'tool', 'tooling', 'platform', 'platforms', 'system',
  'systems', 'architecture', 'architectures', 'architect', 'code', 'coding', 'application',
  'applications', 'app', 'apps', 'web', 'software', 'service', 'services', 'end', 'front',
  'back', 'full', 'interface', 'interfaces', 'user-friendly', 'seamless', 'efficient',
  'optimize', 'optimizing', 'optimization', 'performance', 'speed', 'scale', 'scaling',
  'bachelor', 'bachelors', 'master', 'masters', 'phd', 'education', 'background', 'solid',
  'detail', 'details', 'attention', 'analytical', 'thinking', 'critical', 'interpersonal',
  'presentation', 'written', 'oral', 'client-facing', 'customer-facing', 'deadline', 'deadlines',
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
      // Augment canonical dictionary dynamically with any custom skills seeded/saved in JobRoles
      try {
        const dbRoles = await prisma.jobRole.findMany({ select: { skills: true } });
        for (const role of dbRoles) {
          if (Array.isArray(role.skills)) {
            for (const s of role.skills) {
              if (typeof s === 'string' && s.trim()) {
                const trimmed = s.trim();
                const lower = trimmed.toLowerCase();
                if (!CANONICAL_SKILLS[lower]) {
                  CANONICAL_SKILLS[lower] = trimmed;
                }
              }
            }
          }
        }
      } catch {
        // Continue with static dictionary
      }

      const rawJd = input.targetJobDescription;
      const rawJdLower = rawJd.toLowerCase();
      const detectedSkills = new Map<string, string>(); // lowerKey -> displayName

      // 1. Check known multi-word & special skills first
      for (const [key, displayName] of Object.entries(CANONICAL_SKILLS)) {
        if (key.includes(' ') || key.includes('.') || key.includes('/') || key.includes('+') || key.includes('#')) {
          const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|[\\s,;()\\/])${escaped}($|[\\s,;()\\/])`, 'i');
          if (regex.test(rawJdLower)) {
            detectedSkills.set(displayName.toLowerCase(), displayName);
          }
        }
      }

      // 2. Tokenize individual words - ONLY accept genuine skills in CANONICAL_SKILLS
      const words = rawJdLower
        .replace(/[^a-zA-Z0-9+#.\s]/g, ' ')
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 1);

      for (const word of words) {
        if (CANONICAL_SKILLS[word]) {
          const canonicalName = CANONICAL_SKILLS[word];
          detectedSkills.set(canonicalName.toLowerCase(), canonicalName);
        }
      }

      const cvTextLower = allText.toLowerCase();
      const matchedKeywords: { keyword: string; count: number }[] = [];
      const missingKeywords: string[] = [];

      for (const [lowerKey, displayName] of detectedSkills.entries()) {
        if (cvTextLower.includes(lowerKey)) {
          const escaped = lowerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const count = (cvTextLower.match(new RegExp(escaped, 'g')) || []).length;
          matchedKeywords.push({ keyword: displayName, count: Math.max(1, count) });
        } else {
          missingKeywords.push(displayName);
        }
      }

      const totalDetected = detectedSkills.size;
      matchPercentage =
        totalDetected > 0
          ? Math.round((matchedKeywords.length / totalDetected) * 100)
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

    let bulletRecommendations: Array<{
      bulletPointId?: string;
      cvItemId?: string;
      originalText: string;
      recommendation: string;
      reason: string;
    }> = [];

    // 1. Fetch cross-referenced interview recommendations if available for this cv
    if (input.cvId) {
      try {
        const sessionWithScorecard = await prisma.interviewSession.findFirst({
          where: { cvId: input.cvId, status: 'COMPLETED' },
          include: { scorecard: true },
          orderBy: { completedAt: 'desc' },
        });
        if (sessionWithScorecard?.scorecard?.cvRecommendations) {
          const recs = sessionWithScorecard.scorecard.cvRecommendations as any[];
          if (Array.isArray(recs) && recs.length > 0) {
            bulletRecommendations.push(
              ...recs.map((r: any) => ({
                bulletPointId: r.bulletPointId || undefined,
                cvItemId: r.cvItemId || undefined,
                originalText: r.originalText || '',
                recommendation: r.recommendation || '',
                reason: r.reason || '',
              }))
            );
          }
        }
      } catch (err: any) {
        logger.warn('ATSService', `Could not fetch session cvRecommendations: ${err.message}`);
      }
    }

    // 2. If no interview recommendations or fewer than 3, identify weak/unquantified bullets from sections
    if (bulletRecommendations.length < 3) {
      sections.forEach((s) => {
        (s.items || []).forEach((item: any) => {
          (item.bulletPoints || []).forEach((b: any) => {
            const text = typeof b === 'string' ? b : b.text;
            if (!text || text.trim().length === 0) return;
            const trimmed = text.trim();
            if (bulletRecommendations.some((r) => r.originalText === trimmed)) return;

            const firstWord = trimmed.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
            const hasPowerVerb = POWER_VERBS.has(firstWord);
            const hasMetric = metricRegex.test(trimmed);

            if (bulletRecommendations.length < 3) {
              const itemTitle = item.title || item.role || s.title || 'project initiative';
              if (!hasMetric && !hasPowerVerb) {
                bulletRecommendations.push({
                  bulletPointId: b.id || undefined,
                  cvItemId: item.id || undefined,
                  originalText: trimmed,
                  recommendation: `Engineered and deployed core features for ${itemTitle}, streamlining workflows and boosting efficiency by 25%.`,
                  reason: 'Original bullet lacks both an action verb and quantifiable metrics. Beginning with "Engineered" and adding concrete percentages elevates ATS impact scoring.',
                });
              } else if (!hasMetric) {
                bulletRecommendations.push({
                  bulletPointId: b.id || undefined,
                  cvItemId: item.id || undefined,
                  originalText: trimmed,
                  recommendation: `${trimmed.replace(/[\.\s]+$/, '')}, accelerating execution and supporting 500+ active users with 99.9% uptime.`,
                  reason: 'Original bullet describes tasks without measurable outcomes. Enriching with concrete scale metrics demonstrates tangible business impact.',
                });
              } else if (!hasPowerVerb) {
                const cleaned = trimmed.replace(/^(responsible for|assisted with|worked on|helped with|contributed to)\s*/i, '');
                const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                bulletRecommendations.push({
                  bulletPointId: b.id || undefined,
                  cvItemId: item.id || undefined,
                  originalText: trimmed,
                  recommendation: `Spearheaded ${capitalized.charAt(0).toLowerCase() + capitalized.slice(1)}`,
                  reason: 'Replaces passive opening phrasing with a strong, decisive power verb to exhibit leadership and initiative.',
                });
              }
            }
          });
        });
      });
    }

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
      bulletRecommendations,
    };
  }
}
