import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/slices/authSlice';
import { selectAuthUser, selectRoleId, selectRoleName } from '../store/selectors/authSelectors';
import { ROLE_IDS } from '../auth/session';
import {
  useDashboardEventsQuery,
  useDashboardPerformersQuery,
  useDashboardStatsQuery,
} from '../features/dashboard/hooks/useDashboardQuery';
import { useNotifications } from '../components/notifications/NotificationProvider';
import SectionSkeleton from './home/SectionSkeleton';

const QuickActionsSection = lazy(() => import('./home/QuickActionsSection'));
const PerformersSection = lazy(() => import('./home/PerformersSection'));
const EventsSection = lazy(() => import('./home/EventsSection'));
const EventScheduleModal = lazy(() => import('./home/EventScheduleModal'));
const SubscriptionPlansModal = lazy(() => import('./home/SubscriptionPlansModal'));

const EVENTS_SCHEDULE_KEY = 'eventsSchedules';

function readSchedulesFromStorage() {
  try {
    const raw = localStorage.getItem(EVENTS_SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { info } = useNotifications();
  const user = useAppSelector(selectAuthUser);
  const userRoleId = useAppSelector(selectRoleId);
  const userRoleName = useAppSelector(selectRoleName);
  const [enableSecondaryQueries, setEnableSecondaryQueries] = useState(false);
  const [performanceMarks, setPerformanceMarks] = useState({ firstPaintMs: null, homeReadyMs: null });
  const [showPlans, setShowPlans] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [nowMs, setNowMs] = useState(Date.now());
  const [eventSchedules, setEventSchedules] = useState(() => readSchedulesFromStorage());
  const isAdmin = [ROLE_IDS.ADMIN, ROLE_IDS.SUPER_ADMIN].includes(Number(userRoleId));
  const hideSubscribeButton = [
    ROLE_IDS.ADMIN,
    ROLE_IDS.SUPER_ADMIN,
    ROLE_IDS.PROMOTOR,
    ROLE_IDS.INFLUENCER,
    ROLE_IDS.STUDENT,
  ].includes(Number(userRoleId));

  const quickActionsRef = useRef(null);
  const performersRef = useRef(null);
  const eventsRef = useRef(null);
  const [performersVisible, setPerformersVisible] = useState(false);
  const [eventsVisible, setEventsVisible] = useState(false);

  const statsQuery = useDashboardStatsQuery({ roleId: userRoleId });
  const performersQuery = useDashboardPerformersQuery({
    roleId: userRoleId,
    enabled: enableSecondaryQueries && performersVisible,
  });
  const eventsQuery = useDashboardEventsQuery({
    roleId: userRoleId,
    enabled: enableSecondaryQueries && eventsVisible,
  });

  const results = statsQuery.data || [];
  const performers = performersQuery.data || [];
  const events = eventsQuery.data || [];

  useEffect(() => {
    const role = Number(userRoleId);
    if (role === ROLE_IDS.ADMIN) {
      navigate('/admin', { replace: true });
      return;
    }
    if (role === ROLE_IDS.SUPER_ADMIN) {
      navigate('/super-admin', { replace: true });
    }
  }, [navigate, userRoleId]);

  useEffect(() => {
    // RoleId 4 == Student: no access to the web application.
    if (Number(userRoleId) === ROLE_IDS.STUDENT) {
      dispatch(logoutThunk());
      navigate('/');
    }
  }, [dispatch, navigate, userRoleId]);

  // Defer non-critical data to let the page paint first.
  useEffect(() => {
    const id = window.setTimeout(() => setEnableSecondaryQueries(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const startedAt = performance.now();
    const paintId = window.requestAnimationFrame(() => {
      const firstPaintMs = Math.round(performance.now() - startedAt);
      setPerformanceMarks((prev) => ({ ...prev, firstPaintMs }));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('[home-performance] first-paint-ms', firstPaintMs);
      }
    });
    return () => window.cancelAnimationFrame(paintId);
  }, []);

  useEffect(() => {
    if (!(results.length || performers.length || events.length)) return;
    const readyMs = Math.round(performance.now());
    setPerformanceMarks((prev) => ({ ...prev, homeReadyMs: readyMs }));
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[home-performance] home-ready-ms', readyMs);
    }
  }, [events.length, performers.length, results.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target === performersRef.current) setPerformersVisible(true);
        if (entry.target === eventsRef.current) setEventsVisible(true);
      });
    }, { rootMargin: '200px 0px', threshold: 0.05 });

    if (quickActionsRef.current) observer.observe(quickActionsRef.current);
    if (performersRef.current) observer.observe(performersRef.current);
    if (eventsRef.current) observer.observe(eventsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!eventsVisible || !events.length) return undefined;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [events.length, eventsVisible]);

  const eventKey = useCallback((evt) => (evt?.id || evt?.path || evt?.name || '').toString(), []);

  const toDateTimeLocalValue = useCallback((iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  }, []);

  const getSchedule = useCallback((evt) => {
    const idKey = evt?.id ? evt.id.toString() : '';
    const pathKey = evt?.path ? evt.path.toString() : '';
    const nameKey = evt?.name ? evt.name.toString() : '';

    if (idKey && eventSchedules[idKey]) return eventSchedules[idKey];
    if (pathKey && eventSchedules[pathKey]) return eventSchedules[pathKey];
    if (nameKey && eventSchedules[nameKey]) return eventSchedules[nameKey];
    return null;
  }, [eventSchedules]);

  const getEventState = useCallback((evt) => {
    const schedule = getSchedule(evt);
    const fromMs = schedule?.from ? new Date(schedule.from).getTime() : null;
    const toMs = schedule?.to ? new Date(schedule.to).getTime() : null;
    const hasRange = fromMs != null && toMs != null && !Number.isNaN(fromMs) && !Number.isNaN(toMs);
    if (!hasRange) return { isActive: false, remainingMs: 0 };
    const isActive = nowMs >= fromMs && nowMs <= toMs;
    const remainingMs = isActive ? Math.max(0, toMs - nowMs) : 0;
    return { isActive, remainingMs };
  }, [getSchedule, nowMs]);

  const formatRemaining = useCallback((ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }, []);

  const openEventModal = useCallback((evt) => {
    const schedule = getSchedule(evt);
    setSelectedEvent(evt);
    setFromValue(toDateTimeLocalValue(schedule?.from || ''));
    setToValue(toDateTimeLocalValue(schedule?.to || ''));
    setShowEventModal(true);
  }, [getSchedule, toDateTimeLocalValue]);

  const saveEventSchedule = useCallback(() => {
    if (!selectedEvent) return;
    if (!fromValue || !toValue) {
      alert('Please select both From and To dates.');
      return;
    }
    const fromMs = new Date(fromValue).getTime();
    const toMs = new Date(toValue).getTime();
    if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
      alert('Invalid date range.');
      return;
    }
    if (toMs < fromMs) {
      alert('To date must be greater than or equal to From date.');
      return;
    }

    const key = eventKey(selectedEvent);
    if (!key) return;

    setEventSchedules((previous) => {
      const next = {
        ...previous,
        [key]: {
          from: new Date(fromMs).toISOString(),
          to: new Date(toMs).toISOString(),
        },
      };
      localStorage.setItem(EVENTS_SCHEDULE_KEY, JSON.stringify(next));
      return next;
    });
    setShowEventModal(false);
  }, [eventKey, fromValue, selectedEvent, toValue]);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutThunk());
    navigate('/');
  }, [dispatch, navigate]);

  const onActionClick = useCallback((item) => {
    if (item.path) {
      if (item.navState) navigate(item.path, { state: item.navState });
      else navigate(item.path);
      return;
    }
    info('Coming soon');
  }, [info, navigate]);

  const closePlansAndPay = useCallback(() => {
    setShowPlans(false);
    navigate('/payment');
  }, [navigate]);

  const dashboardHeading = useMemo(() => (
    <div className="px-6 md:px-20 pt-4">
      <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm">◉</span>
        Dashboard
      </h2>
      {isAdmin ? (
        <p className="mt-2 text-sm text-gray-500">Welcome {userRoleName || 'Admin'}</p>
      ) : null}
      {import.meta.env.DEV && performanceMarks.firstPaintMs != null ? (
        <p className="mt-1 text-xs text-slate-400">Render: {performanceMarks.firstPaintMs}ms</p>
      ) : null}
    </div>
  ), [isAdmin, performanceMarks.firstPaintMs, userRoleName]);

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-gradient-to-r from-green-100 to-blue-100 shadow">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-3 cursor-pointer bg-transparent"
          aria-label="Go to Home"
        >
          <img
            src="/alpha-vlogs-logo.png"
            alt="Alpha Vlogs logo"
            className="w-14 h-14 object-contain rounded-full"
          />
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-blue-800">
            Alpha Vlogs
          </h1>
        </button>
        <div className="flex items-center gap-3">
          {!hideSubscribeButton && (
            <button
              onClick={() => setShowPlans(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition text-sm"
            >
              Subscribe
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      {dashboardHeading}
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 pt-16">
        <div ref={quickActionsRef}>
          <Suspense fallback={<SectionSkeleton rows={3} className="mb-12" />}>
            <QuickActionsSection actions={results} onActionClick={onActionClick} />
          </Suspense>
        </div>

        <div ref={performersRef}>
          {performersVisible ? (
            <Suspense fallback={<SectionSkeleton rows={4} className="mb-12" />}>
              <PerformersSection performers={performers} />
            </Suspense>
          ) : (
            <SectionSkeleton rows={4} className="mb-12" />
          )}
        </div>

        <div ref={eventsRef}>
          {eventsVisible ? (
            <Suspense fallback={<SectionSkeleton rows={6} className="mb-12" />}>
              <EventsSection
                events={events}
                getEventState={getEventState}
                formatRemaining={formatRemaining}
                onOpenSchedule={openEventModal}
              />
            </Suspense>
          ) : (
            <SectionSkeleton rows={6} className="mb-12" />
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <EventScheduleModal
          open={showEventModal}
          selectedEvent={selectedEvent}
          fromValue={fromValue}
          toValue={toValue}
          onClose={() => setShowEventModal(false)}
          onFromChange={setFromValue}
          onToChange={setToValue}
          onSave={saveEventSchedule}
          getEventState={getEventState}
          formatRemaining={formatRemaining}
        />
        <SubscriptionPlansModal open={showPlans} onCloseAndPay={closePlansAndPay} />
      </Suspense>
    </div>
  );
};

export default Home;
