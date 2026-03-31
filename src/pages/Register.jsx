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
//         <div className="text-2xl font-bold text-green-800">Alpha Vlogs</div>
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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerThunk } from '../store/slices/authSlice';
import { selectRegisterStatus } from '../store/selectors/authSelectors';
import { useNotifications } from '../components/notifications/NotificationProvider';
import PasswordField from '../components/forms/common/PasswordField';
import {
  validateRegisterWizardState,
  normalizeEmail,
  digitsOnly,
  trimInput,
} from '../lib/validation';
import { extractFieldErrorsFromCaughtError } from '../lib/validation/apiFieldErrors';
import { PASSWORD_REQUIREMENTS_SUMMARY } from '../lib/passwordPolicy';

function Register() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationType, setRegistrationType] = useState('PROMOTOR');
  const [influencerName, setInfluencerName] = useState('');
  const [influencerHouse, setInfluencerHouse] = useState('');
  const [influencerStreet, setInfluencerStreet] = useState('');
  const [influencerDistrict, setInfluencerDistrict] = useState('');
  const [influencerState, setInfluencerState] = useState('');
  const [influencerPincode, setInfluencerPincode] = useState('');
  const [influencerPromoCode, setInfluencerPromoCode] = useState('');
  const [influencerPhoto, setInfluencerPhoto] = useState(null); // base64 data URL
  const [influencerInstagramProfileLink, setInfluencerInstagramProfileLink] = useState('');
  const [influencerYoutubeProfileLink, setInfluencerYoutubeProfileLink] = useState('');

  // School registration-specific fields
  const [schoolName, setSchoolName] = useState('');
  const [schoolHouse, setSchoolHouse] = useState('');
  const [schoolStreet, setSchoolStreet] = useState('');
  const [schoolDistrict, setSchoolDistrict] = useState('');
  const [schoolState, setSchoolState] = useState('');
  const [schoolPincode, setSchoolPincode] = useState('');
  const [schoolHasMultipleBranches, setSchoolHasMultipleBranches] = useState(false);
  const [schoolBranchCode, setSchoolBranchCode] = useState('');
  const [schoolLogo, setSchoolLogo] = useState(null); // base64 data URL

  const [focusedField, setFocusedField] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const registerStatus = useAppSelector(selectRegisterStatus);
  const { success: notifySuccess } = useNotifications();

  const handleRegister = async () => {
    setSubmitError('');
    const wizard = validateRegisterWizardState({
      registrationType,
      email,
      mobile,
      password,
      confirmPassword,
      influencerName,
      influencerHouse,
      influencerStreet,
      influencerDistrict,
      influencerState,
      influencerPincode,
      influencerPromoCode,
      influencerInstagramProfileLink,
      influencerYoutubeProfileLink,
      schoolName,
      schoolHouse,
      schoolStreet,
      schoolDistrict,
      schoolState,
      schoolPincode,
      schoolHasMultipleBranches,
      schoolBranchCode,
    });

    if (!wizard.ok) {
      setFormErrors(wizard.errors);
      const firstKey = Object.keys(wizard.errors)[0];
      setFocusedField(firstKey === 'registrationType' ? null : firstKey);
      return;
    }

    setFormErrors({});

    const payload = {
      username: normalizeEmail(email),
      password,
      mobilenumber: digitsOnly(mobile),
      role: registrationType,
    };

    if (registrationType === 'PROMOTOR') {
      payload.name = trimInput(influencerName);
      payload.house = trimInput(influencerHouse);
      payload.street = trimInput(influencerStreet);
      payload.district = trimInput(influencerDistrict);
      payload.state = trimInput(influencerState);
      payload.pincode = trimInput(influencerPincode);
      payload.address = `${trimInput(influencerHouse)}, ${trimInput(influencerStreet)}, ${trimInput(influencerDistrict)}`;
      if (trimInput(influencerPromoCode)) payload.promoCode = trimInput(influencerPromoCode);
      if (influencerPhoto) payload.photo = influencerPhoto;
      if (trimInput(influencerInstagramProfileLink)) {
        payload.instagramProfileLink = trimInput(influencerInstagramProfileLink);
      }
      if (trimInput(influencerYoutubeProfileLink)) {
        payload.youtubeProfileLink = trimInput(influencerYoutubeProfileLink);
      }
    }

    if (registrationType === 'SCHOOL') {
      payload.name = trimInput(schoolName);
      payload.house = trimInput(schoolHouse);
      payload.street = trimInput(schoolStreet);
      payload.district = trimInput(schoolDistrict);
      payload.state = trimInput(schoolState);
      payload.pincode = trimInput(schoolPincode);
      payload.address = `${trimInput(schoolHouse)}, ${trimInput(schoolStreet)}, ${trimInput(schoolDistrict)}`;
      payload.hasMultipleBranches = !!schoolHasMultipleBranches;
      payload.branchCode = schoolHasMultipleBranches ? trimInput(schoolBranchCode) : '';
      if (schoolLogo) payload.photo = schoolLogo;
    }

    try {
      const result = await dispatch(registerThunk(payload)).unwrap();
      notifySuccess(result?.response || 'User registered successfully.');
      navigate('/');
    } catch (error) {
      setSubmitError(error?.message || 'Something went wrong. Please try again later.');
      const apiFields = extractFieldErrorsFromCaughtError(error);
      if (Object.keys(apiFields).length) {
        setFormErrors((prev) => ({ ...prev, ...apiFields }));
      }
    }
  };

  return (
    <div>
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
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 text-sm"
        >
          Login
        </button>
      </header>

      <div className="flex justify-center items-start min-h-screen py-10 bg-gradient-to-tr from-green-100 to-green-300 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        >
          <h2 className="text-3xl font-bold mb-6 text-green-700 text-center">
            Create a New Account
          </h2>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={(e) => {
              setEmail(normalizeEmail(e.target.value));
              setFocusedField(null);
            }}
            className={`w-full p-4 border rounded-lg mb-4 text-lg ${
              formErrors.email
                ? 'border-red-600'
                : focusedField === 'email'
                  ? 'border-green-700'
                  : 'border-green-300'
            } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
            placeholder="Email"
            required
          />
          {formErrors.email && (
            <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
          )}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onFocus={() => setFocusedField('mobile')}
            onBlur={() => setFocusedField(null)}
            className={`w-full p-4 border rounded-lg mb-4 text-lg ${
              formErrors.mobile
                ? 'border-red-600'
                : focusedField === 'mobile'
                  ? 'border-green-700'
                  : 'border-green-300'
            } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
            placeholder="Mobile Number"
            type="tel"
            required
          />
          {formErrors.mobile && (
            <p className="text-xs text-red-600 mt-1">{formErrors.mobile}</p>
          )}
          <div className="w-full mb-4">
            <div className="flex gap-2 bg-green-50 p-1 rounded-lg border border-green-200">
              <button
                type="button"
                onClick={() => {
                  setRegistrationType('SCHOOL');
                  setFormErrors({});
                  setFocusedField(null);
                }}
                className={`flex-1 py-3 rounded-md text-sm font-semibold transition ${
                  registrationType === 'SCHOOL'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-700 hover:bg-green-100'
                }`}
              >
                Schools
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrationType('PROMOTOR');
                  setFormErrors({});
                  setFocusedField(null);
                }}
                className={`flex-1 py-3 rounded-md text-sm font-semibold transition ${
                  registrationType === 'PROMOTOR'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-700 hover:bg-green-100'
                }`}
              >
                Promoters
              </button>
            </div>
          </div>
          {formErrors.registrationType && (
            <p className="text-xs text-red-600 mt-2">{formErrors.registrationType}</p>
          )}

          {registrationType === 'SCHOOL' && (
            <div className="w-full mb-4">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                onFocus={() => setFocusedField('schoolName')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.schoolName
                    ? 'border-red-600'
                    : focusedField === 'schoolName'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="Name of school"
                required
              />
              {formErrors.schoolName && (
                <p className="text-xs text-red-600 mt-1">{formErrors.schoolName}</p>
              )}

              <div className="w-full mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={schoolHasMultipleBranches}
                    onChange={(e) => setSchoolHasMultipleBranches(e.target.checked)}
                  />
                  School has multiple branches
                </label>
              </div>

              {schoolHasMultipleBranches && (
                <>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    value={schoolBranchCode}
                    onChange={(e) => setSchoolBranchCode(e.target.value)}
                    onFocus={() => setFocusedField('schoolBranchCode')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                      formErrors.schoolBranchCode
                        ? 'border-red-600'
                        : focusedField === 'schoolBranchCode'
                          ? 'border-green-700'
                          : 'border-green-300'
                    } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                    placeholder="Branch code"
                    required
                  />
                  {formErrors.schoolBranchCode && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.schoolBranchCode}</p>
                  )}
                </>
              )}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={schoolHouse}
                onChange={(e) => setSchoolHouse(e.target.value)}
                onFocus={() => setFocusedField('schoolHouse')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.schoolHouse
                    ? 'border-red-600'
                    : focusedField === 'schoolHouse'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="House"
                required
              />
              {formErrors.schoolHouse && (
                <p className="text-xs text-red-600 mt-1">{formErrors.schoolHouse}</p>
              )}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={schoolStreet}
                onChange={(e) => setSchoolStreet(e.target.value)}
                onFocus={() => setFocusedField('schoolStreet')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.schoolStreet
                    ? 'border-red-600'
                    : focusedField === 'schoolStreet'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="Street"
                required
              />
              {formErrors.schoolStreet && (
                <p className="text-xs text-red-600 mt-1">{formErrors.schoolStreet}</p>
              )}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={schoolDistrict}
                onChange={(e) => setSchoolDistrict(e.target.value)}
                onFocus={() => setFocusedField('schoolDistrict')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.schoolDistrict
                    ? 'border-red-600'
                    : focusedField === 'schoolDistrict'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="District"
                required
              />
              {formErrors.schoolDistrict && (
                <p className="text-xs text-red-600 mt-1">{formErrors.schoolDistrict}</p>
              )}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={schoolState}
                onChange={(e) => setSchoolState(e.target.value)}
                onFocus={() => setFocusedField('schoolState')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.schoolState
                    ? 'border-red-600'
                    : focusedField === 'schoolState'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="State"
                required
              />
              {formErrors.schoolState && (
                <p className="text-xs text-red-600 mt-1">{formErrors.schoolState}</p>
              )}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={schoolPincode}
                onChange={(e) => setSchoolPincode(e.target.value)}
                onFocus={() => setFocusedField('schoolPincode')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.schoolPincode
                    ? 'border-red-600'
                    : focusedField === 'schoolPincode'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="Pincode"
                inputMode="numeric"
                required
              />
              {formErrors.schoolPincode && (
                <p className="text-xs text-red-600 mt-1">{formErrors.schoolPincode}</p>
              )}

              <div className="w-full mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School logo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setSchoolLogo(null);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => setSchoolLogo(reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </div>
          )}
          {registrationType === 'PROMOTOR' && (
            <div className="w-full mb-4">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerName}
                onChange={(e) => setInfluencerName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.name
                    ? 'border-red-600'
                    : focusedField === 'name'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="Name"
                required
              />
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerHouse}
                onChange={(e) => setInfluencerHouse(e.target.value)}
                onFocus={() => setFocusedField('house')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.house
                    ? 'border-red-600'
                    : focusedField === 'house'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="House"
                required
              />
              {formErrors.house && (
                <p className="text-xs text-red-600 mt-1">{formErrors.house}</p>
              )}
              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerStreet}
                onChange={(e) => setInfluencerStreet(e.target.value)}
                onFocus={() => setFocusedField('street')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.street
                    ? 'border-red-600'
                    : focusedField === 'street'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="Street"
                required
              />
              {formErrors.street && (
                <p className="text-xs text-red-600 mt-1">{formErrors.street}</p>
              )}
              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerDistrict}
                onChange={(e) => setInfluencerDistrict(e.target.value)}
                onFocus={() => setFocusedField('district')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.district
                    ? 'border-red-600'
                    : focusedField === 'district'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="District"
                required
              />
              {formErrors.district && (
                <p className="text-xs text-red-600 mt-1">{formErrors.district}</p>
              )}
              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerState}
                onChange={(e) => setInfluencerState(e.target.value)}
                onFocus={() => setFocusedField('state')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.state
                    ? 'border-red-600'
                    : focusedField === 'state'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="State"
                required
              />
              {formErrors.state && (
                <p className="text-xs text-red-600 mt-1">{formErrors.state}</p>
              )}
              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerPincode}
                onChange={(e) => setInfluencerPincode(e.target.value)}
                onFocus={() => setFocusedField('pincode')}
                onBlur={() => setFocusedField(null)}
                className={`w-full p-4 border rounded-lg mb-4 text-lg ${
                  formErrors.pincode
                    ? 'border-red-600'
                    : focusedField === 'pincode'
                      ? 'border-green-700'
                      : 'border-green-300'
                } focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700`}
                placeholder="Pincode"
                inputMode="numeric"
                required
              />
              {formErrors.pincode && (
                <p className="text-xs text-red-600 mt-1">{formErrors.pincode}</p>
              )}

              <div className="w-full mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setInfluencerPhoto(null);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => setInfluencerPhoto(reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerPromoCode}
                onChange={(e) => setInfluencerPromoCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                className={`w-full p-4 border rounded-lg mb-0 text-lg ${
                  formErrors.promoCode ? 'border-red-600' : 'border-green-300'
                }`}
                placeholder="Promo code (optional)"
              />
              {formErrors.promoCode ? (
                <p className="text-xs text-red-600 mt-1">{formErrors.promoCode}</p>
              ) : null}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerInstagramProfileLink}
                onChange={(e) => setInfluencerInstagramProfileLink(e.target.value)}
                className={`w-full p-4 border rounded-lg mt-4 mb-2 text-lg ${
                  formErrors.instagram ? 'border-red-600' : 'border-green-300'
                }`}
                placeholder="Instagram profile link (optional)"
              />
              {formErrors.instagram ? (
                <p className="text-xs text-red-600 mb-2">{formErrors.instagram}</p>
              ) : null}

              <motion.input
                whileFocus={{ scale: 1.02 }}
                value={influencerYoutubeProfileLink}
                onChange={(e) => setInfluencerYoutubeProfileLink(e.target.value)}
                className={`w-full p-4 border rounded-lg mb-0 text-lg ${
                  formErrors.youtube ? 'border-red-600' : 'border-green-300'
                }`}
                placeholder="YouTube profile link (optional)"
              />
              {formErrors.youtube ? (
                <p className="text-xs text-red-600 mt-1">{formErrors.youtube}</p>
              ) : null}
            </div>
          )}

          <div className="mb-4">
            <PasswordField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              error={formErrors.password}
              showStrength={Boolean(password)}
              showRequirementsHint
              requirementsHint={PASSWORD_REQUIREMENTS_SUMMARY}
              className="[&_input]:w-full [&_input]:p-4 [&_input]:text-lg [&_input]:rounded-lg [&_input]:border-green-300 focus-within:[&_input]:ring-2 focus-within:[&_input]:ring-green-200"
              placeholder="Password"
              autoComplete="new-password"
            />
          </div>
          <div className="mb-6">
            <PasswordField
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              error={formErrors.confirmPassword}
              className="[&_input]:w-full [&_input]:p-4 [&_input]:text-lg [&_input]:rounded-lg [&_input]:border-green-300 focus-within:[&_input]:ring-2 focus-within:[&_input]:ring-green-200"
              placeholder="Confirm Password"
              autoComplete="new-password"
            />
          </div>
          {submitError ? <p className="text-sm text-red-600 mb-3">{submitError}</p> : null}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            onClick={handleRegister}
            disabled={registerStatus === 'loading'}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerStatus === 'loading' ? 'Registering...' : 'Register'}
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

