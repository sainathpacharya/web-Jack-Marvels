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
import { login as apiLogin } from '../api/auth';
import { setSession } from '../auth/session';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const getDashboardPath = (roleId) => {
    // Routing is controlled ONLY by roleId.
    const id = roleId == null ? null : Number(roleId);
    switch (id) {
      case 1:
        return '/home';
      default:
        // TODO: add future roleId routing here.
        return '/home';
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    try {
      const auth = await apiLogin({ username: username.trim(), password });
      const user = auth?.me ?? auth?.user ?? auth?.profile ?? auth;

      const accessToken =
        auth?.accessToken ??
        auth?.token ??
        auth?.access_token ??
        user?.accessToken ??
        user?.token ??
        user?.access_token ??
        '';
      const refreshToken =
        auth?.refreshToken ??
        auth?.refresh_token ??
        user?.refreshToken ??
        user?.refresh_token ??
        '';

      // Store user for Home page / role-based rendering.
      // `role` is treated as UI-only display value (secondary to roleId).
      const userForStorage = { ...user, role: user?.roleName };
      localStorage.setItem('user', JSON.stringify(userForStorage));

      setSession({ accessToken, refreshToken, me: userForStorage });
      alert('Login successful!');
      navigate(getDashboardPath(userForStorage?.roleId));
    } catch (error) {
      console.error('Login error:', error);
      alert(error?.message || 'Something went wrong. Please try again later.');
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
