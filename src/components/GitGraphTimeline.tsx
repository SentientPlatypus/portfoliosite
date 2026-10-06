import { GitBranch, GitCommit, Circle } from 'lucide-react';
import { WorkTimeline } from './WorkTimeline';
import { motion } from 'framer-motion';

export const GitGraphTimeline = () => {
  const experiences = [
    {
      date: '2025-05 — Present',
      title: 'Software Developer Intern, AWS Cryptography',
      company: 'Amazon Web Services',
      commit: 'feat: AWS Cryptography internship',
      hash: 'a7f3c9d',
      branch: 'main'
    },
    {
      date: '2022-08 — Present',
      title: 'Student',
      company: 'Cornell University',
      commit: 'feat: Electrical & Computer Engineering @ Cornell',
      hash: 'b2e4d1a',
      branch: 'main'
    },
    {
      date: '2020-09 — 2024-06',
      title: 'FRC Robotics',
      company: 'Code Red Robotics',
      commit: 'feat: FRC Robotics - Vision Systems',
      hash: 'c5a8f2b',
      branch: 'main'
    },
    {
      date: '2026-02',
      title: '1st Place',
      company: 'Cornell Makeathon 2026',
      commit: 'feat: Won 1st Place at Cornell Makeathon with GroovyAR',
      hash: 'd9c1e4f',
      branch: 'main'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <GitBranch className="w-5 h-5 text-[var(--theme-method)]" />
        <h2 className="text-xl font-bold text-[var(--theme-method)]">Experience Timeline</h2>
        <span className="text-xs text-[#858585] ml-auto">main</span>
      </div>

      <div className="space-y-0 relative">
        {/* Git graph line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-[var(--theme-border)]" />

        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-10 pb-8 group hover:bg-[var(--theme-sidebar)]/50 -ml-2 p-2 rounded transition-colors"
          >            {/* Commit dot */}
            <div className="absolute left-[5px] top-[8px] w-[14px] h-[14px] rounded-full bg-[var(--theme-editor)] border-2 border-[var(--theme-method)] z-10 group-hover:border-[var(--theme-string)] transition-colors" />
            
            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--theme-string)]">{exp.hash}</span>
                <span className="text-xs text-[#858585]">{exp.date}</span>
              </div>
              <div className="text-sm font-semibold text-[var(--theme-foreground)]">
                {exp.title}
              </div>
              <div className="text-sm text-[var(--theme-variable)]">
                {exp.company}
              </div>
              <div className="text-xs text-[var(--theme-comment)] font-mono">
                {exp.commit}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Initial commit */}
        <div className="relative pl-10 pb-4 group hover:bg-[var(--theme-sidebar)]/50 -ml-2 p-2 rounded transition-colors">
          <div className="absolute left-[5px] top-[8px] w-[14px] h-[14px] rounded-full bg-[var(--theme-editor)] border-2 border-[#858585] z-10" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--theme-string)]">e1a9b5c</span>
              <span className="text-xs text-[#858585]">Initial commit</span>
            </div>
            <div className="text-xs text-[var(--theme-comment)] font-mono">
              chore: portfolio initialized
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--theme-border)]">
        <details className="cursor-pointer">
          <summary className="text-sm font-semibold text-[var(--theme-method)] hover:text-[var(--theme-string)] transition-colors">
            View Detailed Timeline
          </summary>
          <div className="mt-4">
            <WorkTimeline />
          </div>
        </details>
      </div>
    </div>
  );
};
