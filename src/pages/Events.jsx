import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { logoutFromServer } from '../api/auth';
import SiteHeader from '../components/layout/SiteHeader';

import eventVideos from '../data/eventVideosCatalog.json';

export default function Events() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventTitle = id ? String(id).charAt(0).toUpperCase() + String(id).slice(1) : 'Featured Event Highlights';
  const [selected, setSelected] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleLogout = async () => {
    await logoutFromServer();
    navigate('/');
  };

  return (
    <div>
      <SiteHeader homePath="/home" showLogout onLogout={handleLogout} />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-4 md:px-8">
          <div className="mb-6 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
            <h2 className="theme-page-title !mb-0">
              {eventTitle}
            </h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="theme-btn-primary"
            >
              Upload Video
            </button>
          </div>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {eventVideos.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="theme-event-card"
                  onClick={() => setSelected(v)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${v.videoId}?autoplay=1&mute=1&loop=1&playlist=${v.videoId}&controls=0&modestbranding=1&showinfo=0`}
                      title={v.title}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-script text-xl text-purple-800">{v.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <AnimatePresence>
          {selected && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl xl:max-w-4xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${selected.videoId}?autoplay=1`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={selected.title}
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 font-script text-3xl text-purple-800">{selected.title}</h3>
                  <div className="mt-4 flex gap-3">
                    <button
                      className="theme-btn-primary"
                      onClick={() => setShowUploadModal(true)}
                    >
                      Upload Video
                    </button>
                    <button
                      className="theme-btn-secondary"
                      onClick={() => setSelected(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Video modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="theme-card-lg w-full max-w-md">
              <h3 className="mb-4 font-script text-3xl text-purple-800">Upload Video</h3>
              <p className="mb-4 font-body text-sm text-gray-600">Upload your performance video for this event.</p>
              <input type="file" accept="video/*" className="w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-peach-highlight file:px-4 file:py-2 file:font-label file:text-brand-orange" />
              <div className="mt-4 flex gap-3">
                <button onClick={() => setShowUploadModal(false)} className="theme-btn-secondary flex-1 py-2">Cancel</button>
                <button onClick={() => { setShowUploadModal(false); alert('Upload started (demo).'); }} className="theme-btn-primary flex-1 py-2">Upload</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
