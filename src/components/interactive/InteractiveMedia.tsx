import { lazy, Suspense } from 'react';
import type { InteractiveKind } from './kinds';

const FourierModes = lazy(() => import('./FourierModes'));
const QuantJL = lazy(() => import('./QuantJL'));

export const PosterFallback = ({ src, title }: { src: string; title: string }) => (
  <img
    src={src}
    alt={title}
    className="w-full h-auto"
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
);

export const InteractiveProjectView = ({
  kind,
  poster,
  title,
}: {
  kind: InteractiveKind;
  poster: string;
  title: string;
}) => {
  if (kind === 'fouriermesh-david') {
    return (
      <Suspense fallback={<PosterFallback src={poster} title={title} />}>
        <FourierModes poster={poster} title={title} />
      </Suspense>
    );
  }
  if (kind === 'quantjl') {
    return (
      <Suspense fallback={<PosterFallback src={poster} title={title} />}>
        <QuantJL poster={poster} title={title} />
      </Suspense>
    );
  }
  return <PosterFallback src={poster} title={title} />;
};
