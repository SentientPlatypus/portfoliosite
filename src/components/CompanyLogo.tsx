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
  fullBleed?: boolean;
}

/** Logo on a subtle white chip (readable in every theme) with an initials fallback. */
export const CompanyLogo = ({ src, company, size = 40, className = '', fullBleed = false }: CompanyLogoProps) => {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <div
      className={`flex-shrink-0 rounded-lg bg-white ring-1 ring-black/10 shadow-sm flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, padding: fullBleed && showImg ? 0 : Math.round(size * 0.12) }}
      data-company-logo={company}
    >
      {showImg ? (
        <img
          src={src}
          alt={`${company} logo`}
          className={`w-full h-full ${fullBleed ? 'object-cover' : 'object-contain'}`}
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

export const CompanyName = ({ company, className = '' }: { company: string; className?: string }) => (
  <span className={className}>{company}</span>
);
