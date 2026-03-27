import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { logoutFromServer } from '../api/auth';

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
    <div className="bg-green-100">
      <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-green-100 shadow">
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
          <div className="text-xl font-bold text-green-800">Alpha Vlogs</div>
        </button>
        {/* <nav className="hidden md:flex space-x-6 text-sm">
          <a href="#" className="hover:text-green-700">Home</a>
          <a href="#" className="hover:text-green-700">About</a>
          <a href="#" className="hover:text-green-700">Blog</a>
          <a href="#" className="hover:text-green-700">Contact</a>
        </nav> */}
        <button
          onClick={handleLogout}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 text-sm"
        >
          Logout
        </button>
      </header>
      
      <section className="pt-4 pb-10 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700 inline-block border-b-4 border-blue-200 pb-1">
              {eventTitle}
            </h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm font-medium"
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
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
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
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800">{v.title}</h4>
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl xl:max-w-4xl overflow-hidden"
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
                  <h3 className="text-2xl font-bold mb-2">{selected.title}</h3>
                  <div className="flex gap-3 mt-4">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                      onClick={() => setShowUploadModal(true)}
                    >
                      Upload Video
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
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
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Video</h3>
              <p className="text-gray-600 text-sm mb-4">Upload your performance video for this event.</p>
              <input type="file" accept="video/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowUploadModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button onClick={() => { setShowUploadModal(false); alert('Upload started (demo).'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Upload</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
