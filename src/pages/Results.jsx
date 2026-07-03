import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { logoutFromServer } from '../api/auth';
import SiteHeader from '../components/layout/SiteHeader';

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
  const handleLogout = async () => {
    await logoutFromServer();
    navigate('/');
  };

  return (
    <div>
      <SiteHeader homePath="/home" showLogout onLogout={handleLogout} />
      <div className="theme-page relative">
      <div className="mx-auto max-w-4xl space-y-12">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="theme-page-title text-center"
        >
          Announce Event Winners
        </motion.h2>

        {/* Winner Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="theme-card space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <label>
              <span className="text-gray-700 font-medium">Select Event</span>
              <select
                value={form.event}
                onChange={(e) => setForm({ ...form, event: e.target.value })}
                className="theme-input mt-1"
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
                className="theme-input mt-1"
                placeholder="Student/Team Name"
                value={form.winner}
                onChange={(e) => setForm({ ...form, winner: e.target.value })}
              />
            </label>
            <label>
              <span className="text-gray-700 font-medium">School</span>
              <input
                type="text"
                className="theme-input mt-1"
                placeholder="e.g. Green Valley School"
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
              />
            </label>
            <label>
              <span className="text-gray-700 font-medium">Area</span>
              <input
                type="text"
                className="theme-input mt-1"
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
              className="theme-input mb-3 mt-1"
              placeholder="Search videos..."
              value={videoSearch}
              onChange={(e) => setVideoSearch(e.target.value)}
            />

            <div className="grid max-h-[300px] grid-cols-2 gap-4 overflow-y-auto rounded-xl border border-orange-100/60 bg-white/50 p-2 sm:grid-cols-3">
              {videoLibrary
                .filter((v) => v.title.toLowerCase().includes(videoSearch.toLowerCase()))
                .map((v, idx) => (
                  <div
                    key={idx}
                    className="theme-card !p-2 transition-all hover:shadow-md"
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
                      className="theme-btn-primary w-full py-1 !text-xs"
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
            className="theme-btn-primary w-full py-3"
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
                className="theme-card"
              >
                <h3 className="mb-1 font-script text-2xl text-purple-800">{r.event}</h3>
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
            className="fixed right-6 top-20 z-50 rounded-xl theme-btn-primary px-6 py-3 shadow-xl"
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
