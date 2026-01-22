// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';

// function Register() {
//   const [email, setEmail] = useState('');
//   const [mobile, setMobile] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const navigate = useNavigate();

//   const handleRegister = () => {
//  //   const users = JSON.parse(localStorage.getItem('users') || '[]');
//     let user = localStorage?.getItem('users') || {}
//     const userExists = user.email == email;


//     if (userExists) {
//       alert('User already exists!');
//       return;
//     }

//     if (!/^[6-9]\d{9}$/.test(mobile)) {
//       alert('Enter a valid 10-digit mobile number starting with 6-9');
//       return;
//     }

//     if (password !== confirmPassword) {
//       alert('Passwords do not match!');
//       return;
//     }

//    // users.push({ email, mobile, password });
//     user = {email:email,mobile:mobile,password:password};
//     localStorage.setItem('users', JSON.stringify(user));
//     alert('Registered successfully!');
//     navigate('/');
//   };

//   return (
//     <div>

//       <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-green-100 shadow">
//         <div className="text-2xl font-bold text-green-800">Jack Marvel</div>
//         {/* <nav className="hidden md:flex space-x-6 text-sm">
//           <a href="#" className="hover:text-green-700">Home</a>
//           <a href="#" className="hover:text-green-700">About</a>
//           <a href="#" className="hover:text-green-700">Blog</a>
//           <a href="#" className="hover:text-green-700">Contact</a>
//         </nav> */}
//         <button
//           onClick={() => { setShowModal(true) }}
//           className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 text-sm"
//         >
//           Login
//         </button>
//       </header>
//     <div className="flex justify-center items-center h-screen bg-gradient-to-tr from-green-100 to-green-300">

//       <motion.div
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.6, ease: 'easeInOut' }}
//         className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md"
//       >
//         <h2 className="text-3xl font-bold mb-6 text-green-700 text-center">
//           Create a New Account
//         </h2>
//         <motion.input
//           whileFocus={{ scale: 1.02 }}
//           value={email}
//           type="email"
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full p-4 border border-green-300 rounded-lg mb-4 text-lg"
//           placeholder="Email"
//         />
//         <motion.input
//           whileFocus={{ scale: 1.02 }}
//           value={mobile}
//           onChange={(e) => setMobile(e.target.value)}
//           className="w-full p-4 border border-green-300 rounded-lg mb-4 text-lg"
//           placeholder="Mobile Number"
//           type="tel"
//         />
//         <motion.input
//           whileFocus={{ scale: 1.02 }}
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-4 border border-green-300 rounded-lg mb-4 text-lg"
//           placeholder="Password"
//           type="password"
//         />
//         <motion.input
//           whileFocus={{ scale: 1.02 }}
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           className="w-full p-4 border border-green-300 rounded-lg mb-6 text-lg"
//           placeholder="Confirm Password"
//           type="password"
//         />
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           onClick={handleRegister}
//           className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
//         >
//           Register
//         </motion.button>
//         <p className="mt-6 text-sm text-center">
//           Already have an account?{' '}
//           <span
//             onClick={() => navigate('/')}
//             className="text-green-700 underline font-semibold cursor-pointer"
//           >
//             Sign In
//           </span>
//         </p>
//       </motion.div>
//     </div>
//     </div>
//   );
// }

// export default Register;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Register() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Basic validations
    if (!email || !mobile || !password || !confirmPassword) {
      alert('Please fill in all the fields!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert('Enter a valid email address!');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      alert('Enter a valid 10-digit mobile number starting with 6-9');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
      alert('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }



    const payload = {
      username: email.trim(),
      password: password,
      mobilenumber: mobile.trim(),
    };

    try {
      const response = await fetch('http://3.254.64.117:8080/jack-marvels/api/registerUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.statusCode === 200) {
        alert(result.response || 'User registered successfully!');
        navigate('/');
      } else {
        alert(result.message || 'Registration failed. Try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <div>
      <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-green-100 shadow">
        <div className="text-2xl font-bold text-green-800">Jack Marvel</div>
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 text-sm"
        >
          Login
        </button>
      </header>

      <div className="flex justify-center items-center h-screen bg-gradient-to-tr from-green-100 to-green-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md"
        >
          <h2 className="text-3xl font-bold mb-6 text-green-700 text-center">
            Create a New Account
          </h2>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-green-300 rounded-lg mb-4 text-lg"
            placeholder="Email"
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full p-4 border border-green-300 rounded-lg mb-4 text-lg"
            placeholder="Mobile Number"
            type="tel"
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-green-300 rounded-lg mb-4 text-lg"
            placeholder="Password"
            type="password"
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 border border-green-300 rounded-lg mb-6 text-lg"
            placeholder="Confirm Password"
            type="password"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
          >
            Register
          </motion.button>
          <p className="mt-6 text-sm text-center">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/')}
              className="text-green-700 underline font-semibold cursor-pointer"
            >
              Sign In
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;

