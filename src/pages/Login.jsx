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


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/images/bg.jpg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk } from '../store/slices/authSlice';
import {
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
  selectMustChangePassword,
  selectRoleId,
} from '../store/selectors/authSelectors';
import { ROLE_IDS } from '../auth/session';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const roleId = useAppSelector(selectRoleId);
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mustChangePassword = useAppSelector(selectMustChangePassword);

  const getDashboardPath = (roleId) => {
    // Routing is controlled ONLY by roleId.
    const id = roleId == null ? null : Number(roleId);
    switch (id) {
      case ROLE_IDS.ADMIN:
        return '/admin';
      case ROLE_IDS.SUPER_ADMIN:
        return '/super-admin';
      case ROLE_IDS.SCHOOL:
        return '/school';
      case ROLE_IDS.PROMOTOR:
      case ROLE_IDS.INFLUENCER:
        return '/promoter';
      case ROLE_IDS.STUDENT:
        // Students should not access the web app.
        return '/';
      default:
        // Unknown roleId: send to public landing page to avoid showing admin UI.
        return '/';
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !roleId) return;
    if (mustChangePassword) {
      navigate('/change-password', { replace: true });
      return;
    }
    navigate(getDashboardPath(roleId), { replace: true });
  }, [isAuthenticated, roleId, mustChangePassword, navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    const action = await dispatch(loginThunk({ username, password }));
    if (!loginThunk.fulfilled.match(action)) {
      alert(action.payload || 'Something went wrong. Please try again later.');
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
          disabled={authStatus === 'loading'}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
        >
          {authStatus === 'loading' ? 'Signing In...' : 'Sign In'}
        </button>
        {authError ? <p className="mt-3 text-sm text-red-600">{authError}</p> : null}
        <p className="mt-6 text-sm text-center">
          Create an account?{' '}
          <span
            onClick={() => navigate('/Register')}
            className="text-green-700 underline font-semibold cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
