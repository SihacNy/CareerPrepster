import { CVData, JobRole, RoleBulletTemplate, ATSReport } from "@/types/cv";

export const INITIAL_EMPTY_CV: CVData = {
  id: "cv-draft-1",
  title: "My University Resume",
  templateId: "classic",
  targetRole: "Software Engineer",
  personalInfo: {
    fullName: "Alex Rivera",
    email: "alex.rivera@university.edu",
    phone: "+1 (555) 432-8901",
    location: "Seattle, WA",
    linkedinUrl: "linkedin.com/in/alexrivera",
    githubUrl: "github.com/alexrivera-dev",
    summary: "Final-year Computer Science student with hands-on experience building full-stack web applications and microservices. Seeking full-time Software Engineer roles.",
  },
  education: [
    {
      id: "edu-1",
      institution: "State University of Technology",
      degree: "B.S. in Computer Science & Engineering",
      location: "Seattle, WA",
      startDate: "Sep 2022",
      endDate: "Jun 2026",
      isCurrent: true,
      gpa: "3.85 / 4.00",
      bulletPoints: [
        "Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Management Systems, Cloud Computing.",
        "Dean's Honor List for 5 consecutive semesters; Vice President of ACM Student Chapter.",
      ],
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "TechNova Solutions",
      role: "Software Engineering Intern",
      location: "Remote",
      startDate: "Jun 2025",
      endDate: "Aug 2025",
      isCurrent: false,
      bulletPoints: [
        "Engineered RESTful microservices using Node.js and TypeScript, reducing client query latency by 32%.",
        "Implemented Redis caching layer for high-throughput product catalog, serving 45,000 daily active requests.",
        "Authored comprehensive unit and integration test suites using Jest, boosting service code coverage from 68% to 91%.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Distributed Task Queue Engine",
      role: "Lead Developer (Capstone Project)",
      techStack: ["TypeScript", "Node.js", "Redis", "Docker", "PostgreSQL"],
      linkUrl: "github.com/alexrivera-dev/task-queue",
      startDate: "Jan 2025",
      endDate: "May 2025",
      bulletPoints: [
        "Architected an asynchronous worker queue in TypeScript processing 10,000+ simulated concurrent jobs per minute.",
        "Constructed dead-letter queuing and exponential backoff retry algorithms to guarantee zero message loss during worker failovers.",
        "Containerized application with Docker Compose for seamless local developer testing and CI/CD validation.",
      ],
    },
    {
      id: "proj-2",
      name: "Algorithmic Code Visualizer",
      role: "Frontend Developer",
      techStack: ["React", "Tailwind CSS", "TypeScript"],
      linkUrl: "github.com/alexrivera-dev/algo-visualizer",
      startDate: "Oct 2024",
      endDate: "Dec 2024",
      bulletPoints: [
        "Developed interactive tree and graph traversal step-by-step visualizations utilized by 1,200+ university classmates.",
        "Optimized canvas render cycles using requestAnimationFrame, achieving sustained 60 FPS performance during large array animations.",
      ],
    },
  ],
  skills: [
    {
      id: "skill-1",
      categoryName: "Programming Languages",
      skills: ["TypeScript", "JavaScript", "Python", "Java", "C++", "SQL"],
    },
    {
      id: "skill-2",
      categoryName: "Frameworks & Web Technologies",
      skills: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS", "REST APIs"],
    },
    {
      id: "skill-3",
      categoryName: "Developer Tools & Cloud",
      skills: ["Git", "Docker", "PostgreSQL", "MySQL", "Redis", "Jest", "Linux"],
    },
  ],
  updatedAt: new Date().toISOString(),
};

export const MOCK_JOB_ROLES: JobRole[] = [
  { id: "role-1", name: "Software Engineer", track: "Engineering" },
  { id: "role-2", name: "Frontend Developer", track: "Engineering" },
  { id: "role-3", name: "Backend Developer", track: "Engineering" },
  { id: "role-4", name: "Full Stack Developer", track: "Engineering" },
  { id: "role-5", name: "Data Analyst", track: "Data & Analytics" },
  { id: "role-6", name: "Data Scientist", track: "Data & Analytics" },
  { id: "role-7", name: "DevOps & Cloud Engineer", track: "Infrastructure" },
  { id: "role-8", name: "Mobile App Developer (React Native / Flutter)", track: "Engineering" },
  { id: "role-9", name: "QA / Automation Engineer", track: "Quality Assurance" },
  { id: "role-10", name: "Cybersecurity Analyst", track: "Security" },
  { id: "role-11", name: "Product Manager (Associate)", track: "Product" },
  { id: "role-12", name: "UI/UX Designer", track: "Design" },
];

export const MOCK_ROLE_BULLETS: RoleBulletTemplate[] = [
  {
    id: "rb-1",
    roleId: "role-1",
    category: "Technical Implementation",
    text: "Architected and deployed scalable RESTful APIs in Node.js and TypeScript, handling 100,000+ weekly requests with 99.9% uptime.",
  },
  {
    id: "rb-2",
    roleId: "role-1",
    category: "System Performance",
    text: "Optimized relational database query execution plans and indexed foreign keys, slashing median response times by 40%.",
  },
  {
    id: "rb-3",
    roleId: "role-1",
    category: "Collaboration & Delivery",
    text: "Collaborated in an Agile scrum team of 6 engineers, participating in bi-weekly sprints, pull request peer reviews, and sprint retrospectives.",
  },
  {
    id: "rb-4",
    roleId: "role-1",
    category: "Problem Solving",
    text: "Designed and implemented automated CI/CD pipelines with GitHub Actions, reducing deployment cycle times from 45 minutes to 8 minutes.",
  },
  {
    id: "rb-5",
    roleId: "role-2",
    category: "Technical Implementation",
    text: "Engineered responsive, accessible single-page web applications utilizing React, Next.js, and Tailwind CSS adhering to WCAG 2.1 AA guidelines.",
  },
  {
    id: "rb-6",
    roleId: "role-2",
    category: "System Performance",
    text: "Implemented code-splitting, dynamic imports, and responsive image compression, elevating Google Lighthouse performance scores from 64 to 98.",
  },
  {
    id: "rb-7",
    roleId: "role-3",
    category: "Technical Implementation",
    text: "Designed microservice architectures utilizing Express and PostgreSQL, implementing JWT-based authentication and role-based access controls.",
  },
  {
    id: "rb-8",
    roleId: "role-5",
    category: "Problem Solving",
    text: "Analyzed 500,000+ historical transactional records in Python and SQL, developing automated interactive dashboards in Tableau to uncover key user retention trends.",
  },
];

export function calculateMockAtsReport(cv: CVData, targetJobDescription?: string): ATSReport {
  let score = 84;
  let parsabilityScore = 24;
  let impactScore = 26;
  let skillsScore = 22;
  let brevityScore = 18;

  const findings: ATSReport["findings"] = [
    {
      id: "f-1",
      type: "passed",
      pillar: "parsability",
      message: "Standard ATS Section Headings",
      recommendation: "All primary sections (Education, Experience, Projects, Skills) use universally recognized naming conventions.",
    },
    {
      id: "f-2",
      type: "passed",
      pillar: "parsability",
      message: "Clean Single-Column Layout",
      recommendation: "Layout strictly adheres to top-to-bottom reading order with no nested tables or floating columns.",
    },
    {
      id: "f-3",
      type: "passed",
      pillar: "impact",
      message: "Strong Action Verbs Present",
      recommendation: "Bullet points lead with compelling verbs such as 'Architected', 'Optimized', and 'Engineered'.",
    },
    {
      id: "f-4",
      type: "suggestion",
      pillar: "impact",
      message: "Quantify More Educational & Project Outcomes",
      recommendation: "Add measurable numbers (e.g. users impacted, latency reduced, percentage improved) to 1 additional bullet point.",
      sectionTarget: "projects",
    },
    {
      id: "f-5",
      type: "suggestion",
      pillar: "skills",
      message: "Cloud & Container Keywords Enhancement",
      recommendation: "Consider listing explicit cloud provider familiarity (e.g. AWS, GCP, Azure) under your developer tools section.",
      sectionTarget: "skills",
    },
    {
      id: "f-6",
      type: "passed",
      pillar: "brevity",
      message: "Ideal Document Length (1 Page)",
      recommendation: "Your resume content fits within the golden 450–650 word range for university graduates and interns.",
    },
  ];

  // If user provided a target job description, run targeted keyword comparison
  let keywordAnalysis: ATSReport["keywordAnalysis"] = undefined;
  if (targetJobDescription && targetJobDescription.trim().length > 10) {
    const jdLower = targetJobDescription.toLowerCase();
    const commonKeywords = [
      "react", "typescript", "node.js", "python", "docker", "sql",
      "aws", "rest api", "git", "ci/cd", "agile", "jest", "microservices"
    ];

    const matchedKeywords: { keyword: string; count: number }[] = [];
    const missingKeywords: string[] = [];

    commonKeywords.forEach((kw) => {
      if (jdLower.includes(kw)) {
        // Check if user CV has it
        const cvJson = JSON.stringify(cv).toLowerCase();
        if (cvJson.includes(kw)) {
          matchedKeywords.push({ keyword: kw.toUpperCase(), count: 2 });
        } else {
          missingKeywords.push(kw.toUpperCase());
        }
      }
    });

    const totalJdKeywords = matchedKeywords.length + missingKeywords.length;
    const matchPercentage = totalJdKeywords > 0 
      ? Math.round((matchedKeywords.length / totalJdKeywords) * 100) 
      : 80;

    keywordAnalysis = {
      matchPercentage,
      matchedKeywords,
      missingKeywords,
    };

    if (missingKeywords.length > 0) {
      findings.unshift({
        id: "f-jd-1",
        type: "critical",
        pillar: "skills",
        message: `Missing ${missingKeywords.length} Target Role Keywords from Job Description`,
        recommendation: `Incorporate relevant missing competencies if experienced: ${missingKeywords.slice(0, 3).join(", ")}.`,
        sectionTarget: "skills",
      });
      score = Math.max(55, score - missingKeywords.length * 4);
      skillsScore = Math.max(14, skillsScore - missingKeywords.length * 2);
    }
  }

  return {
    overallScore: score,
    wordCount: 520,
    estimatedPages: 1,
    breakdown: {
      parsabilityScore,
      impactScore,
      skillsScore,
      brevityScore,
    },
    keywordAnalysis,
    findings,
  };
}
