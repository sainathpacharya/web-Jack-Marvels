import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { changePasswordThunk } from '../store/slices/authSlice';
import {
  selectIsAuthenticated,
  selectMustChangePassword,
  selectRoleId,
} from '../store/selectors/authSelectors';
import { ROLE_IDS } from '../auth/session';
import FormInput from '../components/forms/common/FormInput';
import {
  PASSWORD_REQUIREMENTS_SUMMARY,
  validateStrongPassword,
} from '../lib/passwordPolicy';

function getPostPasswordPath(roleId) {
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
    default:
      return '/home';
  }
}

export default function ForceChangePassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mustChangePassword = useAppSelector(selectMustChangePassword);
  const roleId = useAppSelector(selectRoleId);
  const changePasswordStatus = useAppSelector((s) => s.auth.changePasswordStatus);
  const changePasswordError = useAppSelector((s) => s.auth.changePasswordError);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to={getPostPasswordPath(roleId)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!currentPassword.trim()) {
      next.currentPassword = 'Enter your current password.';
    }
    const strong = validateStrongPassword(newPassword);
    if (!strong.valid) {
      next.newPassword = strong.error;
    }
    if (newPassword !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    const action = await dispatch(
      changePasswordThunk({ currentPassword, newPassword })
    );
    if (changePasswordThunk.fulfilled.match(action)) {
      navigate(getPostPasswordPath(roleId), { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Set a new password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your account requires a new password before you can continue. {PASSWORD_REQUIREMENTS_SUMMARY}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
            <FormInput
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, currentPassword: undefined }));
              }}
              error={fieldErrors.currentPassword}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <FormInput
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, newPassword: undefined }));
              }}
              error={fieldErrors.newPassword}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
            <FormInput
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, confirmPassword: undefined }));
              }}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
          </div>
          {changePasswordError ? (
            <p className="text-sm text-red-600" role="alert">
              {changePasswordError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={changePasswordStatus === 'loading'}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {changePasswordStatus === 'loading' ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
