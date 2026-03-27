import { useQuery } from '@tanstack/react-query';
import { getDashBoardDetails } from '../../../api/dashboard';
import eventsCatalog from '../../../data/eventsCatalog.json';
import { queryKeys } from '../../../lib/queryKeys';
import { QUERY_BACKGROUND_SYNC, QUERY_GC, QUERY_STALE } from '../../../lib/queryConfig';

function getDefaultPerformers() {
  return [
    { event: 'Singing Competition', winner: 'Ananya Rao', school: 'Sunshine High School', image: 'https://picsum.photos/seed/singer/600/240' },
    { event: 'Painting Contest', winner: 'Kabir Shah', school: 'Blue Ridge Academy', image: 'https://picsum.photos/seed/painting/600/240' },
    { event: 'Science Fair', winner: 'Tanya Mehra', school: 'Harmony Kinderhaus', image: 'https://picsum.photos/seed/science/600/240' },
    { event: 'Drama Show', winner: 'Aryan Jain', school: 'Green Valley High', image: 'https://picsum.photos/seed/drama/600/240' },
    { event: 'Debate Battle', winner: 'Mira Kapoor', school: 'Green Leaf School', image: 'https://picsum.photos/seed/debate/600/240' },
    { event: 'Crafting King', winner: 'Yash Joshi', school: 'Crescent Valley School', image: 'https://picsum.photos/seed/crafting/600/240' },
    { event: 'Quiz Master', winner: 'Nikhil Verma', school: 'Ocean View Academy', image: 'https://picsum.photos/seed/quiz/600/240' },
  ];
}

function getFallbackResultsActions(isAdmin) {
  if (isAdmin) {
    return [
      { name: 'Add School', animation: 'https://assets4.lottiefiles.com/packages/lf20_kdx6cani.json', path: '/admin', navState: { defaultNav: 'schools' } },
      { name: 'Add Promoter', animation: 'https://assets6.lottiefiles.com/packages/lf20_u4yrau.json', path: '/admin', navState: { defaultNav: 'promotors' } },
      { name: 'Announce Results', animation: 'https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json', path: '/results' },
      { name: 'Add Quiz', animation: 'https://assets10.lottiefiles.com/packages/lf20_mf5j5kua.json', path: '/QuizCreator' },
      { name: 'Admin Actions', animation: 'https://assets4.lottiefiles.com/packages/lf20_kdx6cani.json', path: '/admin' },
    ];
  }
  return [
    { name: 'Announce Results', animation: 'https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json', path: '/results' },
    { name: 'Add Quiz', animation: 'https://assets10.lottiefiles.com/packages/lf20_mf5j5kua.json', path: '/QuizCreator' },
    { name: 'Send Notice', animation: 'https://assets1.lottiefiles.com/packages/lf20_fcfjwiyb.json', path: '/home' },
  ];
}

function getDefaultEvents() {
  return eventsCatalog.map((evt) => ({
    ...evt,
    animation: evt.animation || null,
  }));
}

function buildFallbackDetails(isAdmin) {
  return {
    Results: getFallbackResultsActions(isAdmin),
    performers: getDefaultPerformers(),
    Events: getDefaultEvents(),
  };
}

async function fetchDashboard({ roleId, signal }) {
  const isAdmin = Number(roleId) === 1;
  const fallbackDetails = buildFallbackDetails(isAdmin);
  try {
    const apiDetails = await getDashBoardDetails({ signal });
    return {
      ...fallbackDetails,
      ...apiDetails,
      Results: Array.isArray(apiDetails?.Results)
        ? apiDetails.Results
        : fallbackDetails.Results,
      performers: Array.isArray(apiDetails?.performers) ? apiDetails.performers : fallbackDetails.performers,
      Events: Array.isArray(apiDetails?.Events)
        ? apiDetails.Events
        : fallbackDetails.Events,
    };
  } catch {
    return fallbackDetails;
  }
}

export function useDashboardStatsQuery({ roleId }) {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(roleId),
    queryFn: ({ signal }) => fetchDashboard({ roleId, signal }).then((data) => data.Results || []),
    staleTime: QUERY_STALE.dashboard,
    gcTime: QUERY_GC.longLived,
    refetchOnWindowFocus: false,
  });
}

export function useDashboardPerformersQuery({ roleId, enabled = true }) {
  return useQuery({
    queryKey: queryKeys.dashboard.performers(roleId),
    queryFn: ({ signal }) => fetchDashboard({ roleId, signal }).then((data) => data.performers || []),
    staleTime: QUERY_STALE.dashboard,
    gcTime: QUERY_GC.longLived,
    refetchInterval: QUERY_BACKGROUND_SYNC.summary,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useDashboardEventsQuery({ roleId, enabled = true }) {
  return useQuery({
    queryKey: queryKeys.dashboard.events(roleId),
    queryFn: ({ signal }) => fetchDashboard({ roleId, signal }).then((data) => data.Events || []),
    staleTime: QUERY_STALE.dashboard,
    gcTime: QUERY_GC.longLived,
    refetchInterval: QUERY_BACKGROUND_SYNC.dashboard,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useDashboardQuery({ roleId }) {
  return useQuery({
    queryKey: queryKeys.dashboard.details(roleId),
    queryFn: ({ signal }) => fetchDashboard({ roleId, signal }),
    staleTime: QUERY_STALE.dashboard,
    gcTime: QUERY_GC.longLived,
    refetchInterval: QUERY_BACKGROUND_SYNC.dashboard,
    refetchOnWindowFocus: false,
  });
}
