import { JobSourceProvider, RawDiscoveredJob, JobDiscoveryQuery } from './job-provider.interface.js';

export class SeedJobProvider implements JobSourceProvider {
  readonly sourceId = 'seed';
  readonly displayName = 'Curated Tech Catalog';

  private readonly SEED_JOBS: RawDiscoveredJob[] = [
    {
      title: 'Junior Frontend Developer',
      company: 'Canal Tech Hub',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80',
      location: 'Phnom Penh, Cambodia',
      workArrangement: 'HYBRID',
      employmentType: 'FULL_TIME',
      description: 'Join our digital product studio building responsive web applications using Next.js, React, and Tailwind CSS. Mentorship provided for graduates with strong JavaScript fundamentals.',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'HTML', 'Git'],
      preferredSkills: ['Next.js', 'Jest'],
      minExperienceYears: 0,
      sourcePlatform: 'seed',
      externalId: 'seed-front-01',
      applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer+Phnom+Penh',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Software Engineer Intern (Full Stack)',
      company: 'Smart Axiata Labs',
      logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&q=80',
      location: 'Phnom Penh, Cambodia',
      workArrangement: 'ON_SITE',
      employmentType: 'INTERNSHIP',
      description: 'Hands-on software development internship working across our internal tools and API microservices. Excellent opportunity for 3rd and 4th year university students.',
      requiredSkills: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'Git'],
      preferredSkills: ['Docker', 'TypeScript'],
      minExperienceYears: 0,
      sourcePlatform: 'seed',
      externalId: 'seed-intern-01',
      applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Intern+Cambodia',
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Backend API Developer (Node.js/TypeScript)',
      company: 'Nexus FinTech Global',
      logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop&q=80',
      location: 'Remote',
      workArrangement: 'REMOTE',
      employmentType: 'FULL_TIME',
      description: 'Looking for a backend engineer passionate about building high-throughput payment gateways and RESTful APIs using TypeScript, Express, Prisma, and PostgreSQL/MySQL.',
      requiredSkills: ['Node.js', 'TypeScript', 'Express', 'SQL', 'Prisma', 'REST API'],
      preferredSkills: ['Redis', 'Docker', 'AWS'],
      minExperienceYears: 1,
      sourcePlatform: 'seed',
      externalId: 'seed-back-01',
      applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Backend+Developer+Remote',
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Junior React Native Mobile Developer',
      company: 'Mekong Ventures',
      logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&q=80',
      location: 'Phnom Penh, Cambodia',
      workArrangement: 'HYBRID',
      employmentType: 'FULL_TIME',
      description: 'Develop and maintain iOS and Android consumer mobile applications using React Native and Expo. Collaborate with UI/UX designers to implement pixel-perfect flows.',
      requiredSkills: ['React Native', 'JavaScript', 'TypeScript', 'REST API'],
      preferredSkills: ['Expo', 'Tailwind CSS'],
      minExperienceYears: 0,
      sourcePlatform: 'seed',
      externalId: 'seed-mobile-01',
      applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=React+Native+Developer+Phnom+Penh',
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Junior Data Analyst & Python Developer',
      company: 'Acuity Analytics Asia',
      logoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop&q=80',
      location: 'Remote',
      workArrangement: 'REMOTE',
      employmentType: 'FULL_TIME',
      description: 'Synthesize data into meaningful business dashboards and automated reports. Strong SQL querying, Python scripting, and data storytelling required.',
      requiredSkills: ['Python', 'SQL', 'MySQL', 'Pandas', 'Git'],
      preferredSkills: ['PowerBI', 'Tableau', 'Docker'],
      minExperienceYears: 0,
      sourcePlatform: 'seed',
      externalId: 'seed-data-01',
      applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Data+Analyst+Remote',
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Associate DevOps & Cloud Engineer',
      company: 'CloudBridge Solutions',
      logoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=100&h=100&fit=crop&q=80',
      location: 'Phnom Penh, Cambodia',
      workArrangement: 'HYBRID',
      employmentType: 'FULL_TIME',
      description: 'Assist in maintaining containerized production workloads on Docker and AWS. Build CI/CD deployment pipelines using GitHub Actions.',
      requiredSkills: ['Docker', 'Linux', 'Git', 'CI/CD', 'AWS'],
      preferredSkills: ['Kubernetes', 'Terraform', 'Python'],
      minExperienceYears: 1,
      sourcePlatform: 'seed',
      externalId: 'seed-devops-01',
      applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=DevOps+Phnom+Penh',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  ];

  async discoverJobs(query?: JobDiscoveryQuery): Promise<RawDiscoveredJob[]> {
    if (!query?.keywords) {
      return this.SEED_JOBS;
    }

    const keyword = query.keywords.toLowerCase();
    const filtered = this.SEED_JOBS.filter(job => 
      job.title.toLowerCase().includes(keyword) ||
      job.description.toLowerCase().includes(keyword) ||
      job.requiredSkills.some(s => s.toLowerCase().includes(keyword))
    );

    return filtered.length > 0 ? filtered : this.SEED_JOBS;
  }
}
