import { useQuery } from '@tanstack/react-query';
import {
  fetchClashStats,
  fetchContributionCalendar,
  fetchGitHubStats,
  fetchLeetCodeStats,
  fetchSpotifyTrack,
  fetchYouTubeStats,
} from '@/lib/socialApi';

const MINUTE = 60_000;

/** These all hit rate-limited public APIs, so cache generously. */
const slowStats = {
  staleTime: 30 * MINUTE,
  gcTime: 60 * MINUTE,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

export const useGitHubStats = () =>
  useQuery({ queryKey: ['github', 'profile'], queryFn: fetchGitHubStats, ...slowStats });

export const useContributionCalendar = () =>
  useQuery({
    queryKey: ['github', 'contributions'],
    queryFn: fetchContributionCalendar,
    ...slowStats,
  });

export const useLeetCodeStats = () =>
  useQuery({ queryKey: ['leetcode'], queryFn: fetchLeetCodeStats, ...slowStats });

export const useYouTubeStats = () =>
  useQuery({ queryKey: ['youtube'], queryFn: fetchYouTubeStats, ...slowStats });

export const useClashStats = () =>
  useQuery({ queryKey: ['clash-royale'], queryFn: fetchClashStats, ...slowStats });

/** Polled far more aggressively so "now playing" actually tracks the song. */
export const useSpotifyTrack = () =>
  useQuery({
    queryKey: ['spotify'],
    queryFn: fetchSpotifyTrack,
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });
