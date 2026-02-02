import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
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







const Home = () => {
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [dashBoardDetails, setDashBoardDetails] = useState({ "Results": [], "performers": [], "Events": [], })


  useEffect(() => {
    setDashBoardDetails({
      "Results": [{
        name: 'Announce Results',
        animation: 'https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json',
        path: '/results',
      },
      { name: 'Add Quiz', animation: quiz, path: '/QuizCreator' },
      {
        name: 'Send Notice',
        animation: 'https://assets1.lottiefiles.com/packages/lf20_fcfjwiyb.json',
        path: null,
      },
      ],
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
        { name: 'Singing', animation: singing, path: '/events/singing' },
        { name: 'Dancing', animation: dance, path: '/events/dancing' },
        { name: 'Painting', animation: painting, path: '/events/painting' },
        { name: 'Quiz', animation: quiz, path: '/events/quiz' },
        { name: 'Poetry', animation: poetry, path: '/events/poetry' },
        { name: 'Debate', animation: debate, path: '/events/debate' },
        { name: 'Crafting', animation: crafting, path: '/events/crafting' },
        { name: 'Drama', animation: drama, path: '/events/drama' },
        { name: 'Movie Dialogues', animation: movieDialogues, path: '/events/movie-dialogues' },
        { name: 'Science Fair', animation: science, path: '/events/science' },
        { name: 'Special Talent', animation: specialTalent, path: '/events/special-talent' },
        { name: 'Twins Act', animation: twinsAct, path: '/events/twins-act' },
        { name: 'Tongue Twister', animation: tongueTwister, path: '/events/tongue-twister' },
      ]
    })
  })

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-gradient-to-r from-green-100 to-blue-100 shadow">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-blue-800">
          Alpha Vlogs
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPlans(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition text-sm"
          >
            Subscribe
          </button>
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
                  navigate(item.path);
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
              onClick={() => navigate(item.path)}
            >
              <div className="bg-white p-3 rounded-full shadow-inner">
                <Player autoplay loop src={item.animation} style={{ height: 80, width: 80 }} />
              </div>
              <span className="mt-3 text-sm font-semibold text-gray-700 text-center">{item.name}</span>
            </motion.div>
          ))}
        </div>}



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
