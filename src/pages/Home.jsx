import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { clearSession, getCurrentUser, getUserRoleId, getUserRoleName } from '../auth/session';
import {
  subscribeAnimation,
  paymentAnimation,
  resultsAnimation,
} from '../animations/index';
import {
  basketBall,
  cooking,
  crafting,
  dance,
  debate,
  drama,
  footBall,
  movieDialogues,
  nationalAnthem,
  painting,
  poems,
  poetry,
  quiz,
  science,
  shayari,
  singing,
  specialTalent,
  tongueTwister,
  twinsAct,
} from '../animations';

import eventsCatalog from '../data/eventsCatalog.json';
import { getDashBoardDetails } from '../api/dashboard';







const Home = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userRoleId = getUserRoleId();
  const userRoleName = getUserRoleName();
  const isAdmin = userRoleId === 1;
  const hideSubscribeButton = [1, 3, 4].includes(userRoleId);
  const fallbackResultsActions = isAdmin
    ? [
        {
          name: 'Add School',
          animation: resultsAnimation,
          path: '/admin',
          navState: { defaultNav: 'schools' },
        },
        {
          name: 'Add Promoter',
          animation: paymentAnimation,
          path: '/admin',
          navState: { defaultNav: 'promotors' },
        },
        {
          name: 'Announce Results',
          animation: 'https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json',
          path: '/results',
        },
        { name: 'Add Quiz', animation: quiz, path: '/QuizCreator' },
        { name: 'Admin Actions', animation: resultsAnimation, path: '/admin' },
      ]
    : [
        {
          name: 'Announce Results',
          animation: 'https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json',
          path: '/results',
        },
        { name: 'Add Quiz', animation: quiz, path: '/QuizCreator' },
        {
          name: 'Send Notice',
          animation: 'https://assets1.lottiefiles.com/packages/lf20_fcfjwiyb.json',
          path: '/home',
        },
      ];

  const lottieByKey = {
    singing,
    dance,
    painting,
    quiz,
    poetry,
    debate,
    crafting,
    drama,
    movieDialogues,
    science,
    specialTalent,
    tongueTwister,
    twinsAct,
    shayari,
    poems,
    nationalAnthem,
    footBall,
    basketBall,
    cooking,
  };

  const resolveAnimation = (anim) => {
    if (!anim) return anim;
    if (typeof anim !== 'string') return anim;
    // If backend returns animation as a URL, return as-is.
    if (anim.startsWith('http://') || anim.startsWith('https://')) return anim;
    return lottieByKey[anim] || anim;
  };

  const [showPlans, setShowPlans] = useState(false);
  const [dashBoardDetails, setDashBoardDetails] = useState({ "Results": [], "performers": [], "Events": [], })

  const EVENTS_SCHEDULE_KEY = 'eventsSchedules';

  const [eventSchedules, setEventSchedules] = useState(() => {
    try {
      const raw = localStorage.getItem(EVENTS_SCHEDULE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const eventKey = (evt) => (evt?.id || evt?.path || evt?.name || '').toString();

  const toDateTimeLocalValue = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    // datetime-local expects: YYYY-MM-DDTHH:mm
    return d.toISOString().slice(0, 16);
  };

  const getSchedule = (evt) => {
    const idKey = evt?.id ? evt.id.toString() : '';
    const pathKey = evt?.path ? evt.path.toString() : '';
    const nameKey = evt?.name ? evt.name.toString() : '';

    if (idKey && eventSchedules[idKey]) return eventSchedules[idKey];
    if (pathKey && eventSchedules[pathKey]) return eventSchedules[pathKey];
    if (nameKey && eventSchedules[nameKey]) return eventSchedules[nameKey];
    return null;
  };

  const getEventState = (evt) => {
    const schedule = getSchedule(evt);
    const fromMs = schedule?.from ? new Date(schedule.from).getTime() : null;
    const toMs = schedule?.to ? new Date(schedule.to).getTime() : null;
    const hasRange = fromMs != null && toMs != null && !Number.isNaN(fromMs) && !Number.isNaN(toMs);
    if (!hasRange) return { isActive: false, remainingMs: 0 };
    const isActive = nowMs >= fromMs && nowMs <= toMs;
    const remainingMs = isActive ? Math.max(0, toMs - nowMs) : 0;
    return { isActive, remainingMs };
  };

  const formatRemaining = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const openEventModal = (evt) => {
    const schedule = getSchedule(evt);
    setSelectedEvent(evt);
    setFromValue(toDateTimeLocalValue(schedule?.from || ''));
    setToValue(toDateTimeLocalValue(schedule?.to || ''));
    setShowEventModal(true);
  };

  const saveEventSchedule = () => {
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

    const updated = {
      ...eventSchedules,
      [key]: {
        from: new Date(fromMs).toISOString(),
        to: new Date(toMs).toISOString(),
      },
    };
    setEventSchedules(updated);
    localStorage.setItem(EVENTS_SCHEDULE_KEY, JSON.stringify(updated));
    setShowEventModal(false);
  };


  useEffect(() => {
    const resultsActions = isAdmin
      ? [
          {
            name: 'Add School',
            animation: resultsAnimation,
            path: '/admin',
            navState: { defaultNav: 'schools' },
          },
          {
            name: 'Add Promoter',
            animation: paymentAnimation,
            path: '/admin',
            navState: { defaultNav: 'promotors' },
          },
          {
            name: 'Announce Results',
            animation: 'https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json',
            path: '/results',
          },
          { name: 'Add Quiz', animation: quiz, path: '/QuizCreator' },
          {
            name: 'Admin Actions',
            animation: resultsAnimation,
            path: '/admin',
          },
        ]
      : [
          {
            name: 'Announce Results',
            animation: 'https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json',
            path: '/results',
          },
          { name: 'Add Quiz', animation: quiz, path: '/QuizCreator' },
          {
            name: 'Send Notice',
            animation: 'https://assets1.lottiefiles.com/packages/lf20_fcfjwiyb.json',
            path: '/home',
          },
        ];

    setDashBoardDetails({
      "Results": resultsActions,
      "performers": [
        {
          event: "Singing Competition",
          winner: "Ananya Rao",
          school: "Sunshine High School",
          image: "https://picsum.photos/seed/singer/600/240",
        },
        {
          event: "Painting Contest",
          winner: "Kabir Shah",
          school: "Blue Ridge Academy",
          image: "https://picsum.photos/seed/painting/600/240",
        },
        {
          event: "Science Fair",
          winner: "Tanya Mehra",
          school: "Harmony Kinderhaus",
          image: "https://picsum.photos/seed/science/600/240",
        },
        {
          event: "Drama Show",
          winner: "Aryan Jain",
          school: "Green Valley High",
          image: "https://picsum.photos/seed/drama/600/240",
        },
        {
          event: "Debate Battle",
          winner: "Mira Kapoor",
          school: "Green Leaf School",
          image: "https://picsum.photos/seed/debate/600/240",
        },
        {
          event: "Crafting King",
          winner: "Yash Joshi",
          school: "Crescent Valley School",
          image: "https://picsum.photos/seed/crafting/600/240",
        },
        {
          event: "Quiz Master",
          winner: "Nikhil Verma",
          school: "Ocean View Academy",
          image: "https://picsum.photos/seed/quiz/600/240",
        },
        {
          event: "Singing Competition",
          winner: "Ananya Rao",
          school: "Sunshine High School",
          image: "https://picsum.photos/seed/singer/600/240",
        },
        {
          event: "Painting Contest",
          winner: "Kabir Shah",
          school: "Blue Ridge Academy",
          image: "https://picsum.photos/seed/painting/600/240",
        },
        {
          event: "Science Fair",
          winner: "Tanya Mehra",
          school: "Harmony Kinderhaus",
          image: "https://picsum.photos/seed/science/600/240",
        },
        {
          event: "Drama Show",
          winner: "Aryan Jain",
          school: "Green Valley High",
          image: "https://picsum.photos/seed/drama/600/240",
        },
      ],
      "Events": [
        ...eventsCatalog.map((evt) => ({
          ...evt,
          // Optional fallback animation (we still have lottie assets available).
          animation:
            {
              '/events/singing': singing,
              '/events/dancing': dance,
              '/events/painting': painting,
              '/events/quiz': quiz,
              '/events/poetry': poetry,
              '/events/debate': debate,
              '/events/crafting': crafting,
              '/events/drama': drama,
              '/events/movie-dialogues': movieDialogues,
              '/events/science': science,
              '/events/special-talent': specialTalent,
              '/events/twins-act': twinsAct,
              '/events/tongue-twister': tongueTwister,
            }[evt.path],
        })),
      ]
    })
  }, [isAdmin])

  // Fetch dashboard details dynamically after login.
  useEffect(() => {
    if (userRoleId == null) return;
    let cancelled = false;

    const run = async () => {
      try {
        const apiDetails = await getDashBoardDetails();
        if (cancelled) return;

        const normalized = {
          ...apiDetails,
          Results: Array.isArray(apiDetails?.Results)
            ? apiDetails.Results.map((r) => ({ ...r, animation: resolveAnimation(r.animation) }))
            : [],
          performers: Array.isArray(apiDetails?.performers) ? apiDetails.performers : [],
          Events: Array.isArray(apiDetails?.Events)
            ? apiDetails.Events.map((e) => ({ ...e, animation: resolveAnimation(e.animation) }))
            : [],
        };

        setDashBoardDetails((prev) => {
          if (isAdmin) {
            // Keep admin quick-actions (role-based) even if backend doesn't include them yet.
            const resultsToUse = prev?.Results?.length ? prev.Results : fallbackResultsActions;
            return { ...prev, ...normalized, Results: resultsToUse };
          }
          return normalized;
        });
      } catch (e) {
        console.error('Failed to load dashboard details:', e);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [userRoleId, isAdmin]);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

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
      {/* Student Dashboard heading */}
      <div className="px-6 md:px-20 pt-4">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm">◉</span>
          Dashboard
        </h2>
        {isAdmin && (
          <p className="mt-2 text-sm text-gray-500">
            Welcome {userRoleName || 'Admin'}
          </p>
        )}
      </div>
      {/* Menu Buttons */}
      {dashBoardDetails.Results.length > 0 && <section className="mt-16 mb-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-800">
            🎯 Explore Quick Actions
          </h2>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Manage your events, results, and announcements seamlessly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {dashBoardDetails.Results.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex flex-col items-center justify-center cursor-pointer group border border-indigo-100"
              onClick={() => {
                if (item.path) {
                  if (item.navState) {
                    navigate(item.path, { state: item.navState });
                  } else {
                    navigate(item.path);
                  }
                } else {
                  toast.info('📢 Coming Soon!', {
                    position: 'top-center',
                    autoClose: 2000,
                  });
                }
              }}
            >
              <div className="bg-white p-3 rounded-full shadow-inner border border-indigo-100 group-hover:ring-2 group-hover:ring-indigo-200 transition">
                <Player autoplay loop src={item.animation} style={{ height: 60, width: 60 }} />
              </div>
              <span className="mt-3 text-sm font-semibold text-indigo-800 group-hover:text-indigo-900 transition">
                {item.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>}

      {/* Dashboard */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 pt-16">
        {/* <h2 className="text-2xl font-bold text-center text-green-800 mb-8">
          Welcome to the Interactive Dashboard
        </h2> */}
        {/* Horizontal Scrollable Weekly Winners Banner */}

        {/* Auto-Scrolling Winners Section */}
        {dashBoardDetails.performers.length > 0 && <section className="relative py-12 px-4 md:px-10 bg-gradient-to-r from-indigo-100 to-purple-100 shadow-inner rounded-xl mb-12 overflow-hidden">
          <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-10">
            🌟 This Week's Star Performers 🌟
          </h2>

          <div className="w-full overflow-hidden relative">
            <motion.div
              className="flex gap-8 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            >
              {dashBoardDetails.performers
                .map((winner, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="min-w-[300px] sm:min-w-[400px] md:min-w-[500px] bg-white shadow-xl rounded-3xl overflow-hidden border border-indigo-100 hover:shadow-2xl transform hover:scale-105 transition duration-300"
                  >
                    <img
                      src={winner.image}
                      alt={winner.event}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-indigo-700">{winner.event}</h3>
                      <p className="text-gray-800 font-medium mt-1">🏆 {winner.winner}</p>
                      <p className="text-sm text-gray-600">{winner.school}</p>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </section>}







        {/* Hero Banner */}
        {dashBoardDetails.Events.length > 0 && <section className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl overflow-hidden shadow-lg mb-10">
          <div className="px-6 py-10 md:px-20 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Explore Our Exciting Events</h2>
            <p className="text-sm md:text-base opacity-90">
              Discover, participate, and shine in competitions crafted to showcase every child's unique talent!
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20">
            <img src="https://cdn-icons-png.flaticon.com/512/3163/3163619.png" alt="Event Icon" className="h-40 w-40 object-contain" />
          </div>
        </section>}

        {/* Event Grid */}
        {dashBoardDetails.Events.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          {dashBoardDetails.Events.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br from-white via-${i % 2 === 0 ? 'indigo-50' : 'pink-50'} to-white 
                p-4 rounded-2xl shadow-lg hover:shadow-2xl transition 
                flex flex-col items-center cursor-pointer border border-gray-200`}
              onClick={() => openEventModal(item)}
            >
              <div className="bg-white p-3 rounded-full shadow-inner">
                {item.gifUrl ? (
                  <img
                    src={item.gifUrl}
                    alt={item.name}
                    className="h-20 w-20 object-contain"
                    loading="lazy"
                  />
                ) : item.animation ? (
                  <Player autoplay loop src={item.animation} style={{ height: 80, width: 80 }} />
                ) : null}
              </div>
              <span className="mt-3 text-sm font-semibold text-gray-700 text-center">{item.name}</span>

              {(() => {
                const { isActive, remainingMs } = getEventState(item);
                if (!isActive) {
                  return <div className="mt-1 text-xs text-gray-400 text-center">Inactive</div>;
                }
                return <div className="mt-1 text-xs text-green-700 text-center">Ends in {formatRemaining(remainingMs)}</div>;
              })()}
            </motion.div>
          ))}
        </div>}

        {/* Event schedule modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Set Event Dates</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedEvent.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="datetime-local"
                      value={fromValue}
                      onChange={(e) => setFromValue(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="datetime-local"
                      value={toValue}
                      onChange={(e) => setToValue(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {(() => {
                  const { isActive, remainingMs } = getEventState(selectedEvent);
                  return (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <div className="text-sm text-gray-700 font-medium">
                        Current Status: <span className={isActive ? 'text-green-700' : 'text-gray-600'}>{isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      {isActive && (
                        <div className="text-sm text-gray-600 mt-1">
                          Remaining time: <span className="font-medium">{formatRemaining(remainingMs)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-3 mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEventSchedule}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save & Set Active
                </button>
              </div>
            </div>
          </div>
        )}



      </div>

      {/* Subscription Modal */}
      {showPlans && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 relative">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              onClick={() => {
                setShowPlans(false); // Close modal
                navigate('/payment'); // Go to payment page
              }}
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-700 mb-6">
              Choose the Right Plan for You
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              Unlock exclusive benefits and participate in more events by selecting a subscription plan that fits your needs.
            </p>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <div className="border-2 border-yellow-300 rounded-2xl p-6 bg-yellow-50 hover:shadow-xl transition">
                <h3 className="text-xl font-bold text-yellow-600 mb-2">🌟 Basic Plan</h3>
                <p className="text-3xl font-extrabold text-yellow-700 mb-2">₹99 <span className="text-base font-medium">/month</span></p>
                <ul className="text-gray-700 text-sm space-y-2 mb-4">
                  <li>✅ Access to 5 events</li>
                  <li>✅ Standard support</li>
                  <li>✅ Email notifications</li>
                </ul>
                <button className="w-full bg-yellow-500 text-white py-2 rounded-xl hover:bg-yellow-600 transition" onClick={() => {
                  setShowPlans(false); // Close modal
                  navigate('/payment'); // Go to payment page
                }}>
                  Choose Basic
                </button>
              </div>

              {/* Premium Plan */}
              <div className="border-4 border-green-500 rounded-2xl p-6 bg-white shadow-lg transform scale-105">
                <h3 className="text-xl font-bold text-green-600 mb-2">🔥 Premium Plan</h3>
                <p className="text-3xl font-extrabold text-green-700 mb-2">₹199 <span className="text-base font-medium">/month</span></p>
                <ul className="text-gray-700 text-sm space-y-2 mb-4">
                  <li>✅ Unlimited event access</li>
                  <li>✅ Priority support</li>
                  <li>✅ Participation certificates</li>
                  <li>✅ Early event registration</li>
                </ul>
                <button className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition" onClick={() => {
                  setShowPlans(false); // Close modal
                  navigate('/payment'); // Go to payment page
                }}>
                  Choose Premium
                </button>
              </div>

              {/* Annual Plan */}
              <div className="border-2 border-indigo-300 rounded-2xl p-6 bg-indigo-50 hover:shadow-xl transition">
                <h3 className="text-xl font-bold text-indigo-600 mb-2">💎 Annual Plan</h3>
                <p className="text-3xl font-extrabold text-indigo-700 mb-2">₹999 <span className="text-base font-medium">/year</span></p>
                <ul className="text-gray-700 text-sm space-y-2 mb-4">
                  <li>✅ All Premium benefits</li>
                  <li>✅ Free merchandise kit</li>
                  <li>✅ 1:1 mentor session (yearly)</li>
                  <li>✅ Priority email + phone support</li>
                </ul>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition" onClick={() => {
                  setShowPlans(false); // Close modal
                  navigate('/payment'); // Go to payment page
                }}>
                  Choose Annual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
