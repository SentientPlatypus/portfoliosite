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
  /** Logo fills its own square (full-bleed in the chip, no white padding). */
  logoFullBleed?: boolean;
}

export type ExperienceCategory = 'professional' | 'research';

export const experienceCategories: { id: ExperienceCategory; label: string; branch: string }[] = [
  { id: 'professional', label: 'Professional Experience', branch: 'professional' },
  { id: 'research', label: 'Research Labs', branch: 'research-labs' },
];


export const experiences: Experience[] = [
  {
    id: 'millennium-applied-ai-engineer',
    title: 'Applied AI Engineer',
    company: 'Millennium',
    period: 'Jun 2027 – Aug 2027', // Jun 7 – Aug 13, 2027
    category: 'professional',
    logo: '/logos/millennium.png',
    logoFullBleed: true,
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
    id: 'cornell-arl-student-researcher',
    category: 'research',
    logo: '/logos/cornell.png',
    title: 'Student Researcher',
    company: 'Cornell Architectural Robotics Lab',
    period: 'Dec 2025 – Present',
    location: 'Ithaca, NY',
    description:
      'Improved the Home+ mobile manipulator platform by installing a dedicated voltage regulator for the companion computer and servos, redesigning servo power distribution, and streamlining wire management for greater reliability. Applied generative design to optimize 3D-printed components and reduce mechanical load, and designed an amplifier circuit for LED control. Also contributing to ongoing manuscript development.',
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
    logoFullBleed: true,
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

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const parseMonth = (txt: string): number | null => {
  const m = txt.trim().match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[1].toLowerCase());
  return mi < 0 ? null : Number(m[2]) * 12 + mi;
};

/**
 * Month indices (year*12+month) parsed from `period`. "Present" = the current month.
 * Returns null for periods without real dates (e.g. "Incoming").
 */
export function periodRange(period: string, now = new Date()): { start: number; end: number } | null {
  const [a, b] = period.split(/\s+[–-]\s+/);
  const start = a ? parseMonth(a) : null;
  if (start === null) return null;
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const end = !b ? start : /present/i.test(b) ? nowIdx : parseMonth(b);
  return end === null ? null : { start, end: Math.max(end, start) };
}

export const monthLabel = (idx: number) =>
  `${MONTHS[idx % 12][0].toUpperCase()}${MONTHS[idx % 12].slice(1)} ${Math.floor(idx / 12)}`;

/** True when the role starts after the current month. */
export const isUpcoming = (exp: { period: string }, now = new Date()) => {
  const r = periodRange(exp.period, now);
  return !!r && r.start > now.getFullYear() * 12 + now.getMonth();
};

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
