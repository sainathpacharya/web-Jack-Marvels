import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../auth/session';

import eventsCatalog from '../data/eventsCatalog.json';

function Results() {
  const navigate = useNavigate();
  const eventOptions = eventsCatalog.map((evt) => evt.name);
  const [form, setForm] = useState({
    event: '',
    winner: '',
    school: '',
    area: '',
    video: '',
  });

  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [videoSearch, setVideoSearch] = useState('');
  const videoLibrary = [
    { title: 'Dance Performance', url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4' },
    { title: 'Singing Finale', url: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4' },
    { title: 'Science Fair Demo', url: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4' },
    { title: 'Drama Act', url: 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4' },
    { title: 'Quiz Final Round', url: 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4' },
  ];

  const handleSubmit = () => {
    if (form.event && form.winner && form.school && form.area && form.video) {
      setResults([...results, form]);
      setForm({ event: '', winner: '', school: '', area: '', video: '' });
      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);
    } else {
      alert('Please fill in all fields');
    }
  };
  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div>
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
    
          <button
            onClick={handleLogout}
            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-20 relative">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-green-800"
        >
          Announce Event Winners
        </motion.h2>

        {/* Winner Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-lg space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <label>
              <span className="text-gray-700 font-medium">Select Event</span>
              <select
                value={form.event}
                onChange={(e) => setForm({ ...form, event: e.target.value })}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select --</option>
                {eventOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-gray-700 font-medium">Winner Name</span>
              <input
                type="text"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
                placeholder="Student/Team Name"
                value={form.winner}
                onChange={(e) => setForm({ ...form, winner: e.target.value })}
              />
            </label>
            <label>
              <span className="text-gray-700 font-medium">School</span>
              <input
                type="text"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
                placeholder="e.g. Green Valley School"
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
              />
            </label>
            <label>
              <span className="text-gray-700 font-medium">Area</span>
              <input
                type="text"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
                placeholder="e.g. Hyderabad"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
            </label>
          </div>
          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Search & Select Winner Video</span>
            <input
              type="text"
              className="w-full mt-1 mb-3 p-2 border border-gray-300 rounded-lg"
              placeholder="Search videos..."
              value={videoSearch}
              onChange={(e) => setVideoSearch(e.target.value)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2 bg-gray-50 border rounded-xl">
              {videoLibrary
                .filter((v) => v.title.toLowerCase().includes(videoSearch.toLowerCase()))
                .map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-2 rounded-lg shadow hover:shadow-md transition-all"
                  >
                    <video
                      src={v.url}
                      className="w-full rounded mb-2"
                      muted
                      height={100}
                      controls
                    />
                    <p className="text-xs font-medium text-center mb-2">{v.title}</p>
                    <button
                      onClick={() => {
                        setForm({ ...form, video: v.url });
                        setVideoSearch('');
                      }}
                      className="w-full bg-green-600 text-white py-1 rounded text-xs hover:bg-green-700"
                    >
                      Select
                    </button>
                  </div>
                ))}
            </div>
          </label>

          {/* Preview */}
          {form.video && (
            <div className="mt-4">
              <video
                src={form.video}
                controls
                className="w-full rounded-xl shadow"
              />
            </div>
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Announce Winner
          </button>
        </motion.div>

        {/* Winners List */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <h3 className="text-xl font-bold text-green-700 mb-1">{r.event}</h3>
                <p>
                  <strong>🏆 {r.winner}</strong><br />
                  {r.school}, {r.area}
                </p>
                <video
                  src={r.video}
                  controls
                  className="mt-3 rounded w-full"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl font-semibold z-50"
          >
            ✅ Winner announced successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
    
  );
}

export default Results;
