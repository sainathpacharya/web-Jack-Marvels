import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { changePasswordThunk } from '../store/slices/authSlice';
import {
  selectIsAuthenticated,
  selectMustChangePassword,
  selectRoleId,
} from '../store/selectors/authSelectors';
import { ROLE_IDS } from '../auth/session';
import PasswordField from '../components/forms/common/PasswordField';
import { changePasswordFormSchema } from '../lib/validation';
import { PASSWORD_REQUIREMENTS_SUMMARY } from '../lib/passwordPolicy';

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to={getPostPasswordPath(roleId)} replace />;
  }

  const onSubmit = async (data) => {
    const action = await dispatch(
      changePasswordThunk({ currentPassword: data.currentPassword, newPassword: data.newPassword })
    );
    if (changePasswordThunk.fulfilled.match(action)) {
      navigate(getPostPasswordPath(roleId), { replace: true });
    }
  };

  const loading = changePasswordStatus === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Set a new password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your account requires a new password before you can continue. Use a strong password you have
          not used elsewhere.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="current-password">
              Current password
            </label>
            <PasswordField
              id="current-password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new-password">
              New password
            </label>
            <PasswordField
              id="new-password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              showStrength={Boolean(newPasswordValue)}
              showRequirementsHint
              requirementsHint={PASSWORD_REQUIREMENTS_SUMMARY}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">
              Confirm new password
            </label>
            <PasswordField
              id="confirm-password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
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
            disabled={loading || !isValid}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
