export const SECTION_TYPES = [
  'EXPERIENCE',
  'EDUCATION',
  'PROJECTS',
  'SKILLS',
  'CERTIFICATIONS',
  'CUSTOM',
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const FRAMEWORKS = ['STAR', 'XYZ', 'STANDARD'] as const;
export type Framework = (typeof FRAMEWORKS)[number];

export const ATS_PILLARS = ['PARSABILITY', 'IMPACT', 'SKILLS', 'BREVITY'] as const;
export type ATSPillar = (typeof ATS_PILLARS)[number];

export const FINDING_SEVERITIES = ['CRITICAL', 'SUGGESTION', 'PASSED'] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export const TEMPLATES = ['classic', 'modern', 'executive-accent', 'modern-photo'] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export const BULLET_CATEGORIES = [
  'Technical Implementation',
  'System Performance',
  'Collaboration & Delivery',
  'Problem Solving',
] as const;
export type BulletCategory = (typeof BULLET_CATEGORIES)[number];
