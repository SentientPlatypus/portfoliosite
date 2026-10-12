export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  location?: string;
  type?: 'internship';
  description?: string;
  skills?: string[];
}

export const experiences: Experience[] = [
  {
    id: 'aws-sde-intern-2026',
    title: 'SDE Intern',
    company: 'Amazon Web Services (AWS)',
    period: 'May 2026 – Aug 2026',
    location: 'Seattle, WA',
    type: 'internship',
  },
  {
    id: 'aws-sde-intern-2025',
    title: 'SDE Intern',
    company: 'Amazon Web Services (AWS)',
    period: 'May 2025 – Aug 2025',
    location: 'Seattle, WA',
    type: 'internship',
  },
  {
    id: 'cornell-asl-research-intern',
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
