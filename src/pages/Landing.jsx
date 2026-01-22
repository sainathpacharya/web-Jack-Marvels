import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import landingPageHero from '../assets/images/landingPageHero.png'
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import heroSectionAnimation from '../animations/heroSectionAnimation.json'
import singingAnimation from '../animations/singingAnimatinon.json'

export default function Landing() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);


  const [landingPageDetails, setLandingPageDetails] = useState({
    "statistics": [],
    "actions": [],
    "events": [],
    "blogs": [],
    "vendors": [],
    "aboutus": "Interactive education platform empowering youth through events and learning.",
    "contact": { "email": "support@jackmarvel.com", "Phone": "+91 98765 43210" },
    "QuickLinks": { "events": "", "login": "", "Help": "" }
  })

  useEffect(() => {
    // need to make an API cal
    setLandingPageDetails({
      "statistics": ['3600+ Students', '980+ Teachers', '40+ Events'],
      "actions": [
        { title: 'Safety & Security' },
        { title: 'Cultural Activities' },
        { title: 'Creative Environment' },
      ],
      "events": [
        {
          title: "Singing Competition",
          desc: "Showcase your vocal talent and wow the audience!",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          winner: "Ananya Sharma",
          school: "Green Valley High",
          winnerDesc: "Ananya impressed everyone with her powerful classical rendition."
        },
        {
          title: "Dancing Showdown",
          desc: "Express yourself through dance with freestyle or classical.",
          videoUrl: "https://www.w3schools.com/html/movie.mp4",
          winner: "Rohan Mehta",
          school: "Sunrise Public School",
          winnerDesc: "Rohan’s freestyle dance amazed the judges with energy and creativity."
        },
        {
          title: "Drawing & Painting",
          desc: "Bring colors to life with your creative sketches.",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          winner: "Sneha Roy",
          school: "Blue Ridge Academy",
          winnerDesc: "Sneha created a stunning nature-themed artwork full of detail and color."
        },
        {
          title: "Running Race",
          desc: "Race to the finish and feel the thrill of victory!",
          videoUrl: "https://www.w3schools.com/html/movie.mp4",
          winner: "Aryan Verma",
          school: "Harmony Kinderhaus",
          winnerDesc: "Aryan won with a blazing sprint finish, cheered by all."
        }
      ],
      "blogs": [
        {
          title: "The Art of Singing",
          image: "https://picsum.photos/id/1011/400/200",
          event: "Singing Competition",
          winner: "Ananya Sharma",
          school: "Green Valley High",
          fullBlog: `Singing is not just an art, it’s an expression of soul. The event showcased the most passionate performers...`,
        },
        {
          title: "Dance That Speaks",
          image: "https://picsum.photos/id/1025/400/200",
          event: "Dancing Showdown",
          winner: "Rohit Mehra",
          school: "Sunrise Public School",
          fullBlog: `From hip-hop to classical, each performance was a story. Rohit mesmerized the audience with flawless moves...`,
        },
        {
          title: "Brush & Canvas",
          image: "https://picsum.photos/id/1035/400/200",
          event: "Drawing & Painting",
          winner: "Sneha Verma",
          school: "Harmony Kinderhaus",
          fullBlog: `Colors met creativity at our art fest. Sneha’s work captured emotions in every brushstroke...`,
        },
      ],
      "vendors": [
        {
          name: "Green Valley High",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1024px-SNice.svg.png",
          theme: "bg-green-50",
          image: "https://picsum.photos/id/1011/600/300",
          bio: "Green Valley High is known for its excellence in academics and sports, offering a nurturing environment for holistic growth.",
          principal: "Mrs. Anjali Deshmukh",
          address: "123 Green Street, Valley Town, IN",
          contact: "+91 98765 12345"
        },
        {
          name: "Blue Ridge Academy",
          logo: "https://cdn-icons-png.flaticon.com/512/1048/1048941.png",
          theme: "bg-blue-50",
          image: "https://picsum.photos/id/1015/600/300",
          bio: "A premium institution focusing on tech-driven learning, Blue Ridge Academy equips students for global opportunities.",
          principal: "Mr. Ravi Shetty",
          address: "45 Ocean Drive, Ridge City, IN",
          contact: "+91 99887 11223"
        },
        {
          name: "Sunrise Public School",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1024px-React-icon.svg.png",
          theme: "bg-yellow-50",
          image: "https://picsum.photos/id/1016/600/300",
          bio: "Sunrise Public School champions creativity, innovation and sustainability in its educational practices.",
          principal: "Ms. Priya Khanna",
          address: "88 Sunshine Blvd, Morningtown, IN",
          contact: "+91 98745 67890"
        },
        {
          name: "Harmony Kinderhaus",
          logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Pleiades_large.jpg",
          theme: "bg-pink-50",
          image: "https://picsum.photos/id/1018/600/300",
          bio: "Harmony Kinderhaus focuses on early childhood education through a play-based curriculum and emotional intelligence.",
          principal: "Dr. Lakshmi Menon",
          address: "67 Peace Road, Harmony Hills, IN",
          contact: "+91 99112 33445"
        }
      ],
      "aboutus": "Interactive education platform empowering youth through events and learning.",
      "contact": { "email": "support@jackmarvel.com", "Phone": "+91 98765 43210" },
      "QuickLinks": { "events": "", "login": "", "Help": "" }
    })


  })


  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username.trim())) {
      alert('Please enter a valid email address as the username.');
      return;
    }



    const payload = {
      username: username.trim(),
      password: password,
    };

    try {
      const response = await fetch('http://3.254.64.117:8080/jack-marvels/api/authenticateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.statusCode === 200) {
        alert(result?.response);
        // alert("login successful")
        localStorage.setItem('currentUser', JSON.stringify({ username }));
        navigate('/home');
      } else {
        alert(result.message || 'Invalid username or password!');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };
  return (
    <div className="font-sans text-gray-800">
      <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-green-100 shadow">
        <div className="text-2xl font-bold text-green-800">Jack Marvel</div>
        {/* <nav className="hidden md:flex space-x-6 text-sm">
            <a href="#" className="hover:text-green-700">Home</a>
            <a href="#" className="hover:text-green-700">About</a>
            <a href="#" className="hover:text-green-700">Blog</a>
            <a href="#" className="hover:text-green-700">Contact</a>
          </nav> */}
        <button
          onClick={() => { setShowModal(true) }}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 text-sm"
        >
          Login
        </button>
      </header>
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-gradient-to-r bg-green-100 shadow">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            The best education <br /> for your future
          </h1>
          <p className="text-gray-600 mb-6">
            Learn, grow, and thrive with our modern, interactive educational platform.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-sm">
            Get Started
          </button>
        </div>


        {/* <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="md:w-1/2 mb-10 md:mb-0">
              <img
                src={landingPageHero}
                alt="Hero"
                className="rounded-xl shadow-lg"
              />
            </div>
          </motion.section> */}

        <div className="md:w-1/2 mb-10 md:mb-0">
          <Player
            autoplay
            loop
            src={heroSectionAnimation}
            //src="https://assets7.lottiefiles.com/packages/lf20_puciaact.json"
            className="md:w-1/2 mb-10 md:mb-0"
            widht
          // style={{ height: '400px', width: '400px', margin: '0 auto' }}
          />
        </div>


      </section>

      {/* Stats */}
      {landingPageDetails.statistics.length > 0 && <section className="bg-white py-10 px-6 md:px-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {landingPageDetails.statistics.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: idx * 0.3, // optional: staggered bounce
            }}
            className="bg-indigo-50 p-6 rounded-xl shadow-lg hover:shadow-2xl transform transition duration-300"
          >
            <h3 className="text-3xl font-bold text-indigo-700 mb-2">{item.split(' ')[0]}</h3>
            <p className="text-gray-600 text-sm">{item.split(' ').slice(1).join(' ')}</p>
          </motion.div>
        ))}
      </section>}




      {/* About Section with Icons */}
      {landingPageDetails.actions.length > 0 && <section className="px-6 md:px-20 py-14 bg-blue-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {landingPageDetails.actions.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <div className="text-indigo-600 text-lg font-semibold mb-2">{item.title}</div>
              <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur.</p>
            </div>
          ))}
        </div>
      </section>}

      {/* Events Section */}
      {landingPageDetails.events.length > 0 && <section className="px-6 md:px-20 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Take a look at our Events</h2>
          <button
            className="text-lg font-bold text-indigo-700 hover:underline"
            onClick={() => setShowModal(true)}
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {landingPageDetails.events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedEvent(event)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
            >
              <video
                src={event.videoUrl}
                className="w-full h-40 object-cover"
                muted
                playsInline
                preload="metadata"
                onMouseOver={e => e.target.play()}
                onMouseOut={e => e.target.pause()}
              />
              <div className="p-4">
                <h4 className="font-semibold text-base mb-1">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </section>}


      {/* Blog Section */}
      {landingPageDetails.blogs.length > 0 && <section className="px-6 md:px-20 py-16 bg-white">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Blogs to look</h2>
          <button
            className="text-lg font-bold text-indigo-700 hover:underline"
            onClick={() => setShowModal(true)}
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {landingPageDetails.blogs.map((blog, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h4 className="text-base font-semibold mb-2">{blog.title}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {blog.fullBlog}
                </p>
                <button
                  className="text-green-600 font-semibold hover:underline text-sm"
                  onClick={() => setSelectedBlog(blog)}
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>}


      {landingPageDetails.vendors.length > 0 && <section className="px-6 md:px-20 py-16 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Our Vendors</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {landingPageDetails.vendors.map((school, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.2, repeat: Infinity, repeatType: 'loop', repeatDelay: 3 }}
              viewport={{ once: false }}
              className={`p-4 rounded-xl shadow-md flex flex-col items-center text-center cursor-pointer ${school.theme}`}
              onClick={() => setSelectedVendor(school)}
            >
              <img
                src={school.logo}
                alt={school.name}
                className="h-24 w-24 object-contain mb-4"
              />
              <h4 className="text-lg font-semibold text-gray-800">{school.name}</h4>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedVendor && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white max-w-2xl w-full p-6 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <img src={selectedVendor.image} alt={selectedVendor.name} className="w-full h-60 object-cover rounded-md mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedVendor.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedVendor.bio}</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Principal:</strong> {selectedVendor.principal}</li>
                  <li><strong>Address:</strong> {selectedVendor.address}</li>
                  <li><strong>Contact:</strong> {selectedVendor.contact}</li>
                </ul>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="mt-6 text-sm text-indigo-600 hover:underline block text-center w-full"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>}


      {/* Newsletter CTA */}
      <section className="bg-green-100  text-center py-12 px-6 md:px-20">
        <h3 className="text-xl font-semibold mb-4">Subscribe to get updates on new courses</h3>
        <div className="flex flex-col sm:flex-row max-w-xl mx-auto gap-4">
          <input
            type="email"
            placeholder="Your email"
            className="p-3 rounded text-black flex-1"
          />
          <button className="bg-yellow-400 px-6 py-3 rounded text-black font-semibold hover:bg-yellow-300">
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 md:px-20 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="text-lg font-bold mb-2">About Us</h4>
            <p>Interactive education platform empowering youth through events and learning.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">Contact</h4>
            <p>Email: support@jackmarvel.com</p>
            <p>Phone: +91 98765 43210</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Events</a></li>
              <li><a href="#" className="hover:underline">Login</a></li>
              <li><a href="#" className="hover:underline">Help</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-10">
          © 2025 Jack Marvel. All rights reserved.
        </div>
      </footer>
      {/* Login Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-green-100 via-white to-blue-100 rounded-xl shadow-2xl w-full max-w-md p-8"
            >
              <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Login to Continue</h2>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email"
                className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button onClick={handleLogin} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded">

                Login
              </button>
              <p className="mt-4 text-center text-sm text-gray-600">
                Not registered yet?{' '}
                <span
                  className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => navigate('/register')}
                >
                  Register
                </span>
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <video
                  controls
                  src={selectedEvent.videoUrl}
                  className="w-full max-h-[400px] object-contain"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-60 text-white rounded-full px-3 py-1 text-sm hover:bg-opacity-80"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-2xl font-bold text-indigo-800">{selectedEvent.title}</h3>
                <p className="text-gray-700">{selectedEvent.desc}</p>
                <div className="text-sm text-gray-600 mt-2">
                  <p><span className="font-semibold">Winner:</span> Rahul Sharma</p>
                  <p><span className="font-semibold">School:</span> Green Valley High School</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



    </div>
  );
}
