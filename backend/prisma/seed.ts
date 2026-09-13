import { PrismaClient, BulletFramework } from '@prisma/client';

const prisma = new PrismaClient();

const jobRolesData = [
  // ---------------------------------------------------------------------------
  // 1. Software Engineering
  // ---------------------------------------------------------------------------
  {
    title: 'Frontend Developer',
    industry: 'Software Engineering',
    description: 'Builds modern, responsive, and performant web interfaces using React, Next.js, and TypeScript.',
    skills: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'HTML5/CSS3', 'REST APIs', 'Jest', 'Git'],
    bullets: [
      {
        powerVerb: 'Engineered',
        bulletText: 'Engineered a responsive single-page dashboard using Next.js and TypeScript, reducing initial page load latency by 35% for over 12,000 monthly active users.',
        skillCategory: 'Frontend Architecture',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Refactored',
        bulletText: 'Refactored legacy CSS into reusable Tailwind CSS utility design tokens, decreasing UI bug tickets by 28% across 4 core feature modules.',
        skillCategory: 'Design Systems',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Implemented',
        bulletText: 'Implemented optimistic client-side caching and debounced search queries, cutting redundant backend API calls by 45%.',
        skillCategory: 'Performance Optimization',
        framework: BulletFramework.STAR,
      },
      {
        powerVerb: 'Constructed',
        bulletText: 'Constructed comprehensive end-to-end component test suites using Jest and React Testing Library, lifting overall test coverage from 52% to 88%.',
        skillCategory: 'Testing & Quality',
        framework: BulletFramework.XYZ,
      },
    ],
  },
  {
    title: 'Backend Developer',
    industry: 'Software Engineering',
    description: 'Designs, implements, and secures scalable REST/GraphQL APIs, databases, and microservices.',
    skills: ['Node.js', 'Express', 'TypeScript', 'MySQL', 'PostgreSQL', 'Prisma', 'Redis', 'Docker', 'JWT', 'REST APIs'],
    bullets: [
      {
        powerVerb: 'Architected',
        bulletText: 'Architected a high-throughput RESTful API with Express and Prisma ORM, handling over 250 requests/second at sub-40ms p95 latency.',
        skillCategory: 'API Architecture',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Optimized',
        bulletText: 'Optimized relational database queries and implemented composite indexing on MySQL, decreasing slow query execution times by 65%.',
        skillCategory: 'Database Engineering',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Integrated',
        bulletText: 'Integrated Redis in-memory caching for session management and rate limiting, mitigating brute-force security vectors and reducing DB load by 40%.',
        skillCategory: 'Security & Caching',
        framework: BulletFramework.STAR,
      },
      {
        powerVerb: 'Developed',
        bulletText: 'Developed robust JWT authentication middleware with HttpOnly cookie rotation, safeguarding 5,000+ registered student accounts.',
        skillCategory: 'Authentication',
        framework: BulletFramework.XYZ,
      },
    ],
  },
  {
    title: 'Full Stack Engineer',
    industry: 'Software Engineering',
    description: 'Delivers complete web applications from responsive frontends to robust databases and deployment pipelines.',
    skills: ['React', 'Next.js', 'Node.js', 'Express', 'TypeScript', 'MySQL', 'Prisma', 'Docker', 'Git', 'CI/CD'],
    bullets: [
      {
        powerVerb: 'Delivered',
        bulletText: 'Delivered an end-to-end web platform from scratch using Next.js, Express, and MySQL, onboarding 1,500 active users within the first month of launch.',
        skillCategory: 'Full Stack Development',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Automated',
        bulletText: 'Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing production release deployment time from 45 minutes to 4 minutes.',
        skillCategory: 'DevOps & Automation',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Standardized',
        bulletText: 'Standardized end-to-end type safety across client and server using shared Zod validation schemas, eliminating runtime serialization errors.',
        skillCategory: 'Architecture & Type Safety',
        framework: BulletFramework.STAR,
      },
      {
        powerVerb: 'Spearheaded',
        bulletText: 'Spearheaded migration from monolithic state management to React Context with localStorage hydration, resolving state desynchronization issues.',
        skillCategory: 'Frontend Architecture',
        framework: BulletFramework.XYZ,
      },
    ],
  },
  {
    title: 'Mobile App Developer',
    industry: 'Software Engineering',
    description: 'Builds cross-platform iOS and Android applications with React Native, Flutter, and mobile API integrations.',
    skills: ['React Native', 'Flutter', 'TypeScript', 'Dart', 'iOS/Android', 'REST APIs', 'Redux', 'Firebase'],
    bullets: [
      {
        powerVerb: 'Developed',
        bulletText: 'Developed a cross-platform mobile application in React Native, achieving 99.8% crash-free sessions across 8,000+ active device installs.',
        skillCategory: 'Mobile Development',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Reduced',
        bulletText: 'Reduced mobile app bundle size by 32% by dynamic asset code-splitting and vector icon migration, enhancing cold-start launch speed by 1.8s.',
        skillCategory: 'Performance Optimization',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Implemented',
        bulletText: 'Implemented offline-first SQLite synchronization with background push notifications via Firebase Cloud Messaging.',
        skillCategory: 'Offline Architecture',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'DevOps & Cloud Engineer',
    industry: 'Software Engineering',
    description: 'Manages cloud infrastructure, container orchestration, CI/CD automation, and site reliability.',
    skills: ['Docker', 'Docker Compose', 'Kubernetes', 'AWS', 'Linux', 'GitHub Actions', 'Terraform', 'Nginx', 'Monitoring'],
    bullets: [
      {
        powerVerb: 'Orchestrated',
        bulletText: 'Orchestrated containerized multi-service environments with Docker Compose, ensuring 100% environment parity between local development and staging.',
        skillCategory: 'Containerization',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Automated',
        bulletText: 'Automated infrastructure provisioning and SSL certificate renewal via Nginx reverse proxies, achieving 99.95% system uptime.',
        skillCategory: 'Infrastructure',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Configured',
        bulletText: 'Configured Prometheus and Grafana monitoring dashboards with automated alerting, reducing Mean Time to Detection (MTTD) by 50%.',
        skillCategory: 'Observability',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'QA Automation Engineer',
    industry: 'Software Engineering',
    description: 'Develops automated testing frameworks, integration tests, and regression testing suites.',
    skills: ['Playwright', 'Cypress', 'Jest', 'TypeScript', 'Selenium', 'Postman', 'API Testing', 'CI/CD'],
    bullets: [
      {
        powerVerb: 'Engineered',
        bulletText: 'Engineered an automated end-to-end regression test suite using Playwright, executing 140+ critical user path tests in under 6 minutes in CI pipelines.',
        skillCategory: 'Test Automation',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Authored',
        bulletText: 'Authored contract validation suites in Postman and Supertest, catching 23 breaking API contract changes prior to production staging.',
        skillCategory: 'API Testing',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Streamlined',
        bulletText: 'Streamlined smoke test execution workflows, cutting manual QA testing overhead by 15 hours per bi-weekly sprint.',
        skillCategory: 'Process Improvement',
        framework: BulletFramework.STAR,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. Data & AI
  // ---------------------------------------------------------------------------
  {
    title: 'Data Analyst',
    industry: 'Data & AI',
    description: 'Extracts actionable business insights, creates interactive BI dashboards, and analyzes complex data trends.',
    skills: ['SQL', 'Python', 'Pandas', 'Power BI', 'Tableau', 'Excel', 'Statistical Analysis', 'Data Cleaning'],
    bullets: [
      {
        powerVerb: 'Formulated',
        bulletText: 'Formulated automated SQL ETL queries and Power BI executive dashboards, saving 12 hours of manual weekly reporting for department leaders.',
        skillCategory: 'Business Intelligence',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Analyzed',
        bulletText: 'Analyzed customer churn patterns across 50,000+ transactional records using Python (Pandas/NumPy), identifying 3 key drivers that improved retention by 14%.',
        skillCategory: 'Statistical Analysis',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Cleaned',
        bulletText: 'Cleaned and structured legacy unstructured survey datasets, boosting data accuracy and completeness from 74% to 98%.',
        skillCategory: 'Data Hygiene',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'Data Scientist',
    industry: 'Data & AI',
    description: 'Builds predictive machine learning models, statistical experiments, and deep learning algorithms to solve complex business challenges.',
    skills: ['Python', 'R', 'SQL', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'Pandas', 'Statistical Modeling', 'A/B Testing', 'Data Visualization'],
    bullets: [
      {
        powerVerb: 'Engineered',
        bulletText: 'Engineered predictive customer lifetime value (LTV) models using XGBoost and Scikit-Learn, lifting cross-sell conversion rates by 23%.',
        skillCategory: 'Predictive Modeling',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Designed',
        bulletText: 'Designed randomized A/B hypothesis test experiments across 45,000 users, establishing statistical significance to optimize onboarding funnels.',
        skillCategory: 'Experimentation & Statistics',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Developed',
        bulletText: 'Developed natural language processing (NLP) classification pipelines to automatically tag 10,000+ monthly customer feedback submissions with 91% accuracy.',
        skillCategory: 'NLP & Text Analytics',
        framework: BulletFramework.STAR,
      },
      {
        powerVerb: 'Formulated',
        bulletText: 'Formulated automated feature engineering pipelines and hyperparameter tuning loops, improving model AUC-ROC score from 0.76 to 0.89.',
        skillCategory: 'Feature Engineering',
        framework: BulletFramework.XYZ,
      },
    ],
  },
  {
    title: 'Data Engineer',
    industry: 'Data & AI',
    description: 'Constructs reliable data pipelines, data warehouses, and scalable ETL workflows.',
    skills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'PostgreSQL', 'BigQuery', 'Kafka', 'Docker'],
    bullets: [
      {
        powerVerb: 'Architected',
        bulletText: 'Architected scalable batch ETL data pipelines using Apache Airflow and PostgreSQL, processing 2M+ daily event records with zero pipeline failures.',
        skillCategory: 'Data Pipelines',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Optimized',
        bulletText: 'Optimized distributed SQL queries and partitioning strategies in BigQuery, lowering compute query costs by 34%.',
        skillCategory: 'Query Optimization',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Constructed',
        bulletText: 'Constructed automated data validation checkpoints, catching schema drifts and null anomalies before downstream dashboard ingestion.',
        skillCategory: 'Data Quality',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'Machine Learning Engineer',
    industry: 'Data & AI',
    description: 'Trains, optimizes, and deploys predictive ML models and LLM applications into production environments.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Hugging Face', 'FastAPI', 'Docker', 'MLflow'],
    bullets: [
      {
        powerVerb: 'Trained',
        bulletText: 'Trained and fine-tuned transformer classification models with PyTorch, achieving 92.4% F1-score across a multi-class dataset of 100k samples.',
        skillCategory: 'Model Training',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Deployed',
        bulletText: 'Deployed ML inference microservices using FastAPI and Docker, achieving sub-60ms model inference latency under concurrent loads.',
        skillCategory: 'Model Serving',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Implemented',
        bulletText: 'Implemented MLflow experiment tracking and automated hyperparameter search loops, cutting model experimentation turnaround by 40%.',
        skillCategory: 'MLOps',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'Business Intelligence Analyst',
    industry: 'Data & AI',
    description: 'Translates strategic business requirements into semantic data models and interactive KPI tracking.',
    skills: ['SQL', 'Tableau', 'Power BI', 'Data Modeling', 'Excel', 'Stakeholder Management'],
    bullets: [
      {
        powerVerb: 'Designed',
        bulletText: 'Designed 6 enterprise Tableau dashboards tracking real-time revenue and user conversion KPIs for executive decision-making.',
        skillCategory: 'Dashboard Design',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Identified',
        bulletText: 'Identified conversion funnel drop-offs through cohort analysis, informing UI changes that boosted checkout completion by 18%.',
        skillCategory: 'Conversion Analysis',
        framework: BulletFramework.XYZ,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. Product & Design
  // ---------------------------------------------------------------------------
  {
    title: 'UI/UX Designer',
    industry: 'Product & Design',
    description: 'Designs intuitive wireframes, responsive UI prototypes, and accessible design systems.',
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing', 'Accessibility (WCAG)'],
    bullets: [
      {
        powerVerb: 'Designed',
        bulletText: 'Designed responsive web and mobile design systems with 120+ modular Figma components, speeding up developer handoff by 30%.',
        skillCategory: 'Design Systems',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Conducted',
        bulletText: 'Conducted usability testing sessions with 24 target users, iterating navigation UX to reduce task completion time by 42%.',
        skillCategory: 'User Research',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Audited',
        bulletText: 'Audited digital assets for WCAG 2.1 AA accessibility compliance, resolving contrast and screen reader focus discrepancies.',
        skillCategory: 'Accessibility',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'Associate Product Manager',
    industry: 'Product & Design',
    description: 'Coordinates cross-functional development sprints, defines product requirements, and tracks KPI delivery.',
    skills: ['Product Roadmap', 'Agile/Scrum', 'Jira', 'User Stories', 'PRD Authoring', 'Data-Driven Decisions', 'A/B Testing'],
    bullets: [
      {
        powerVerb: 'Authored',
        bulletText: 'Authored 4 comprehensive Product Requirement Documents (PRDs) and prioritized 80+ Jira user stories across 6 bi-weekly development sprints.',
        skillCategory: 'Product Execution',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Managed',
        bulletText: 'Managed cross-functional agile ceremonies between engineering, design, and QA, achieving 94% on-time sprint epic delivery.',
        skillCategory: 'Sprint Leadership',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Launched',
        bulletText: 'Launched an A/B tested user onboarding flow that increased week-1 student retention from 38% to 56%.',
        skillCategory: 'Growth & Metrics',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'Technical Project Coordinator',
    industry: 'Product & Design',
    description: 'Facilitates sprint roadmaps, manages risk registers, and aligns multi-stakeholder milestone deliverables.',
    skills: ['Agile', 'Scrum', 'Jira', 'Confluence', 'Risk Management', 'Milestone Tracking', 'Communication'],
    bullets: [
      {
        powerVerb: 'Coordinated',
        bulletText: 'Coordinated technical deliverables across 3 engineering teams, delivering the MVP release 2 weeks ahead of scheduled deadline.',
        skillCategory: 'Project Delivery',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Streamlined',
        bulletText: 'Streamlined bug triage workflows in Jira, cutting average ticket resolution time from 4.2 days to 1.8 days.',
        skillCategory: 'Workflow Optimization',
        framework: BulletFramework.XYZ,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. IT & Security
  // ---------------------------------------------------------------------------
  {
    title: 'Cybersecurity Analyst',
    industry: 'IT & Security',
    description: 'Monitors threat vectors, conducts vulnerability assessments, and implements security compliance controls.',
    skills: ['Vulnerability Scanning', 'SIEM', 'Network Security', 'OWASP Top 10', 'Wireshark', 'Linux', 'Incident Response'],
    bullets: [
      {
        powerVerb: 'Conducted',
        bulletText: 'Conducted automated and manual vulnerability scans against 12 web applications, remediating 18 high-severity OWASP vulnerabilities.',
        skillCategory: 'Vulnerability Management',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Implemented',
        bulletText: 'Implemented multi-factor authentication (MFA) and strict role-based access controls (RBAC) across 200+ organizational accounts.',
        skillCategory: 'Access Control',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Monitored',
        bulletText: 'Monitored SIEM security logs and investigated 40+ security alert anomalies, reducing incident response time to under 15 minutes.',
        skillCategory: 'Threat Detection',
        framework: BulletFramework.STAR,
      },
    ],
  },
  {
    title: 'Cloud Infrastructure Administrator',
    industry: 'IT & Security',
    description: 'Maintains cloud environments, server patching, automated backups, and network access policies.',
    skills: ['AWS', 'Linux Server', 'Bash Scripting', 'Networking (VPC, DNS, SSL)', 'Backup & Disaster Recovery', 'Docker'],
    bullets: [
      {
        powerVerb: 'Automated',
        bulletText: 'Automated daily database snapshot backups and offsite archiving via Bash scripts, reducing Recovery Time Objective (RTO) by 60%.',
        skillCategory: 'Disaster Recovery',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Provisioned',
        bulletText: 'Provisioned secure Linux server environments with hardened SSH keys and automated firewall rules, maintaining 99.9% service availability.',
        skillCategory: 'Server Hardening',
        framework: BulletFramework.XYZ,
      },
    ],
  },
  {
    title: 'IT Systems Engineer',
    industry: 'IT & Security',
    description: 'Configures enterprise hardware, user permissions, networking infrastructure, and technical troubleshooting.',
    skills: ['Active Directory', 'Windows/Linux', 'Networking (TCP/IP, DHCP, VPN)', 'Helpdesk', 'Hardware Configuration'],
    bullets: [
      {
        powerVerb: 'Configured',
        bulletText: 'Configured VPN tunnels and Active Directory policies for 150+ remote employees, maintaining zero unauthorized network breaches.',
        skillCategory: 'Enterprise Networking',
        framework: BulletFramework.XYZ,
      },
      {
        powerVerb: 'Resolved',
        bulletText: 'Resolved 350+ Tier-2 technical support tickets with a 96% first-contact resolution rate and 4.9/5 user satisfaction score.',
        skillCategory: 'Technical Support',
        framework: BulletFramework.XYZ,
      },
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing job roles & bullet templates
  await prisma.roleBulletTemplate.deleteMany({});
  await prisma.jobRole.deleteMany({});

  console.log(`📋 Seeding ${jobRolesData.length} Job Roles with Starter Bullets...`);

  for (const roleData of jobRolesData) {
    const role = await prisma.jobRole.create({
      data: {
        title: roleData.title,
        industry: roleData.industry,
        description: roleData.description,
        skills: roleData.skills,
        bullets: {
          create: roleData.bullets.map((bullet) => ({
            bulletText: bullet.bulletText,
            powerVerb: bullet.powerVerb,
            skillCategory: bullet.skillCategory,
            framework: bullet.framework,
          })),
        },
      },
    });

    console.log(`  ✅ Seeded role: "${role.title}" (${roleData.bullets.length} bullets)`);
  }

  const totalRoles = await prisma.jobRole.count();
  const totalBullets = await prisma.roleBulletTemplate.count();

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`📊 Summary: ${totalRoles} Job Roles, ${totalBullets} Starter Bullet Templates.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
