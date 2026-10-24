export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  location?: string;
  type?: 'internship';
  description?: string;
  skills?: string[];
  /** Which branch of the git-graph history this entry lives on. */
  category: ExperienceCategory;
  /** Logo served from /public/logos (official favicon / Wikimedia Commons). */
  logo?: string;
  /** Optional brand accent (used for the company name chip). */
  brandColor?: string;
}

export type ExperienceCategory = 'professional' | 'research';

export const experienceCategories: { id: ExperienceCategory; label: string; branch: string }[] = [
  { id: 'professional', label: 'Professional Experience', branch: 'professional' },
  { id: 'research', label: 'Research Labs', branch: 'research-labs' },
];

/** Millennium Management brand blue: the `--wp--preset--color--blue` token on mlp.com. */
export const MILLENNIUM_BLUE = '#1434cb';

export const experiences: Experience[] = [
  {
    id: 'millennium-applied-ai-engineer',
    title: 'Incoming Applied AI Engineer',
    company: 'Millennium',
    period: 'Incoming',
    category: 'professional',
    logo: '/logos/millennium.png',
    brandColor: MILLENNIUM_BLUE,
  },
  {
    id: 'aws-sde-intern-2026',
    category: 'professional',
    logo: '/logos/aws.svg',
    title: 'SDE Intern',
    company: 'AWS Secrets Manager',
    period: 'May 2026 – Aug 2026',
    location: 'Seattle, WA',
    type: 'internship',
  },
  {
    id: 'aws-sde-intern-2025',
    category: 'professional',
    logo: '/logos/aws.svg',
    title: 'SDE Intern',
    company: 'AWS Cryptography',
    period: 'May 2025 – Aug 2025',
    location: 'Seattle, WA',
    type: 'internship',
  },
  {
    id: 'cornell-asl-research-intern',
    category: 'research',
    logo: '/logos/cornell.png',
    title: 'Research Intern',
    company: 'Cornell Autonomous Systems Lab',
    period: 'Jul 2023 – Jul 2024',
    location: 'Ithaca, NY',
    description:
      'Conducted robotics research in the Autonomous Systems Laboratory under Professor Hadas Kress-Gazit on robot-assisted evacuation of noncompliant humans. Developed LiDAR-based waypoint navigation in ROS for collision-free motion, built an SVM-based hand-silhouette detector from a dataset of 18,000 images, and helped run a 33-participant user study showing that robot-initiated evacuation improved both speed and perceived competence. Work is currently awaiting publication in IJRR.',
    skills: ['Python', 'ROS'],
  },
  {
    id: 'lockheed-martin-systems-intern',
    category: 'professional',
    logo: '/logos/lockheed-martin.png',
    title: 'Systems Engineering Intern',
    company: 'Lockheed Martin',
    period: 'Jul 2023 – Aug 2023',
    location: 'Owego, NY',
    type: 'internship',
    description:
      'Designed ADS-B In, Air Traffic Management, and IFF Antennae status functions for the Mission Performance V280 Team. Presented to management at the end of internship.',
  },
  {
    id: 'salvation-army-music-staff',
    category: 'professional',
    logo: '/logos/salvation-army.png',
    title: 'Music Staff',
    company: 'The Salvation Army – Long Point Camp',
    period: 'Jun 2022 – Jul 2022',
    description:
      'Helped organize activities, and taught students Cornet and Alto Horn one on one.',
  },
];

export function experienceAsJson() {
  return {
    experiences: experiences.map((entry) => {
      const json: Record<string, unknown> = {
        title: entry.title,
        company: entry.company,
        period: entry.period,
      };
      if (entry.location) json.location = entry.location;
      if (entry.type) json.type = entry.type;
      json.branch = experienceCategories.find((c) => c.id === entry.category)?.branch;
      if (entry.description) json.description = entry.description;
      if (entry.skills) json.skills = entry.skills;
      return json;
    }),
  };
}

export function getExperienceSearchText(): string {
  return experiences
    .flatMap((entry) =>
      [
        entry.title,
        entry.company,
        entry.period,
        entry.location,
        entry.type,
        entry.description,
        ...(entry.skills ?? []),
      ].filter(Boolean),
    )
    .join(' ');
}
