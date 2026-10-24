import { useState } from 'react';

const initialsOf = (name: string) =>
  name
    .replace(/^The\s+/i, '')
    .split(/[\s–-]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

interface CompanyLogoProps {
  src?: string;
  company: string;
  size?: number;
  className?: string;
}

/** Logo on a subtle white chip (readable in every theme) with an initials fallback. */
export const CompanyLogo = ({ src, company, size = 40, className = '' }: CompanyLogoProps) => {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <div
      className={`flex-shrink-0 rounded-lg bg-white ring-1 ring-black/10 shadow-sm flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, padding: Math.round(size * 0.12) }}
      data-company-logo={company}
    >
      {showImg ? (
        <img
          src={src}
          alt={`${company} logo`}
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          role="img"
          aria-label={`${company} logo`}
          className="font-semibold text-slate-700"
          style={{ fontSize: Math.round(size * 0.36) }}
        >
          {initialsOf(company)}
        </span>
      )}
    </div>
  );
};

/** Company name, rendered as a brand chip when the entry has a brand colour. */
export const CompanyName = ({ company, brandColor, className = '' }: { company: string; brandColor?: string; className?: string }) =>
  brandColor ? (
    <span
      className={`inline-flex items-center rounded px-1.5 py-px font-semibold text-white shadow-[0_0_12px_-2px_var(--brand)] ${className}`}
      style={{ backgroundColor: brandColor, ['--brand' as string]: brandColor }}
      data-brand-chip
    >
      {company}
    </span>
  ) : (
    <span className={className}>{company}</span>
  );
