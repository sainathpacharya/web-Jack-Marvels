// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import bgImage from '../assets/images/bg.jpg';

// function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = () => {
//    alert("hello")
//     const users = JSON.parse(localStorage.getItem('users') || '[]');
//     console.log("fetched user details",users);
//     const found = users.find(
//       (user) => user.username === username && user.password === password
//     );

//     if (found) {
//       alert('Login successful!');
//       localStorage.setItem('currentUser', JSON.stringify(found)); // ✅ Save session
//       navigate('/home');
//     } else {
//       alert('Invalid username or password!');
//     }
//   };

//   return (
//     <div
//       className="flex justify-center items-center h-screen bg-cover bg-center bg-no-repeat"
//       style={{
//         backgroundImage: `url(${bgImage})`,
//       }}
//     >
//       <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl w-full max-w-md">
//         <h2 className="text-3xl font-bold mb-6 text-green-700 text-center">
//           Please Sign In to Continue
//         </h2>
//         <input
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="w-full p-4 border border-green-300 rounded-lg mb-5 text-lg"
//           placeholder="Username"
//         />
//         <input
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-4 border border-green-300 rounded-lg mb-6 text-lg"
//           placeholder="Password"
//           type="password"
//         />
//         <button
//           onClick={handleLogin}
//           className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
//         >
//           Sign In
//         </button>
//         <p className="mt-6 text-sm text-center">
//           Don’t have an account?{' '}
//           <span
//             onClick={() => navigate('/register')}
//             className="text-green-700 underline font-semibold cursor-pointer"
//           >
//             Register Now
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/images/bg.jpg';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'admin', label: 'Admin' },
  { value: 'promoter', label: 'Promoter' },
  { value: 'super_admin', label: 'Super Admin' },
];

// Demo credentials (skip API when used) — use for local testing
const DEMO_CREDENTIALS = {
  username: 'admin@demo.com',
  password: 'Admin123!',
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const getDashboardPath = (userRole) => {
    switch (userRole) {
      case 'super_admin': return '/super-admin';
      case 'admin': return '/admin';
      case 'promoter': return '/promoter';
      default: return '/home';
    }
  };

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

    // Demo login: skip API and go to dashboard by selected role
    const isDemoLogin =
      username.trim().toLowerCase() === DEMO_CREDENTIALS.username.toLowerCase() &&
      password === DEMO_CREDENTIALS.password;
    if (isDemoLogin) {
      alert('Login successful! (Demo)');
      const currentUser = { username: username.trim(), role };
      if (role === 'promoter') currentUser.promoterId = 1;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      navigate(getDashboardPath(role));
      return;
    }

    const payload = {
      username: username.trim(),
      password: password,
    };

    try {
      const response = await fetch('http://3.254.64.117:8080/jack-marvels/api/authenticateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        const userRole = result.role || role;
        alert(result.response || 'Login successful!');
        const currentUser = { username: username.trim(), role: userRole };
        if (userRole === 'promoter') currentUser.promoterId = result.promoterId ?? 1;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        navigate(getDashboardPath(userRole));
      } else {
        alert(result.message || 'Invalid username or password!');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };




  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-green-700 text-center">
          Please Sign In to Continue
        </h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-4 border border-green-300 rounded-lg mb-5 text-lg"
          placeholder="Username"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 border border-green-300 rounded-lg mb-5 text-lg"
          placeholder="Password"
          type="password"
        />
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Login as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-4 border border-green-300 rounded-lg text-lg bg-white"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
        >
          Sign In
        </button>
        <p className="mt-6 text-sm text-center">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-green-700 underline font-semibold cursor-pointer"
          >
            Register Now
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
