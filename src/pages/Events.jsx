import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const eventVideos = [
  {
    id: '1',
    title: 'Kids Singing Performance',
    videoId: '6ZfuNTqbHE8', // Popular kids choir/contest themes
    thumbnail: 'https://img.youtube.com/vi/6ZfuNTqbHE8/mqdefault.jpg',
  },
  {
    id: '2',
    title: 'Junior Dance Talent',
    videoId: 'ScMzIvxBSi4',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/mqdefault.jpg',
  },
  {
    id: '3',
    title: 'Science Fair Winner',
    videoId: 'aqz-KE-bpKQ',
    thumbnail: 'https://img.youtube.com/vi/aqz-KE-bpKQ/mqdefault.jpg',
  },
  {
    id: '4',
    title: 'Poetry Recitation by Kids',
    videoId: 'M7lc1UVf-VE',
    thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg',
  },
  {
    id: '5',
    title: 'Drama Scene - Kids Special',
    videoId: 'tgbNymZ7vqY',
    thumbnail: 'https://img.youtube.com/vi/tgbNymZ7vqY/mqdefault.jpg',
  },
  {
    id: '6',
    title: 'Art and Craft Show',
    videoId: 'dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  },
  {
    id: '7',
    title: 'Kids Magic Talent',
    videoId: 'e-ORhEE9VVg',
    thumbnail: 'https://img.youtube.com/vi/e-ORhEE9VVg/mqdefault.jpg',
  },
  {
    id: '8',
    title: 'Twins Act Special',
    videoId: 'dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  },
  {
    id: '9',
    title: 'Quiz Competition Highlights',
    videoId: '2Vv-BfVo4g',
    thumbnail: 'https://img.youtube.com/vi/2Vv-BfVo4g/mqdefault.jpg',
  },
  {
    id: '10',
    title: 'Tongue Twister Finals',
    videoId: 'LXb3EKWsInQ',
    thumbnail: 'https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg',
  },
];

export default function Events() {
  const location = useLocation();
const eventTitle = location.state?.title || "Featured Event Highlights";
  const [selected, setSelected] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="bg-green-100">
      <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-green-100 shadow">
        <div className="text-2xl font-bold text-green-800">Jack Marvel</div>
        {/* <nav className="hidden md:flex space-x-6 text-sm">
          <a href="#" className="hover:text-green-700">Home</a>
          <a href="#" className="hover:text-green-700">About</a>
          <a href="#" className="hover:text-green-700">Blog</a>
          <a href="#" className="hover:text-green-700">Contact</a>
        </nav> */}
        <button
          onClick={() => { handleLogout}}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 text-sm"
        >
          Logout
        </button>
      </header>
      
      <section className="pt-4 pb-10 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700 inline-block border-b-4 border-blue-200 pb-1">
              {"Dance"}
            </h2>
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
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </div>

     
  );
}
