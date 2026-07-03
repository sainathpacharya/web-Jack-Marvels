import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { loginFormSchema, normalizeEmail, trimInput } from '../lib/validation';
import PasswordField from '../components/forms/common/PasswordField';

function getDashboardPath(roleId) {
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
    case ROLE_IDS.TEACHER:
      return '/';
    default:
      return '/';
  }
}

function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const roleId = useAppSelector(selectRoleId);
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mustChangePassword = useAppSelector(selectMustChangePassword);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (!isAuthenticated || !roleId) return;
    if (mustChangePassword) {
      navigate('/change-password', { replace: true });
      return;
    }
    navigate(getDashboardPath(roleId), { replace: true });
  }, [isAuthenticated, roleId, mustChangePassword, navigate]);

  const onSubmit = async ({ username, password }) => {
    const u = typeof username === 'string' && username.includes('@') ? normalizeEmail(username) : trimInput(username);
    const action = await dispatch(loginThunk({ username: u, password }));
    if (!loginThunk.fulfilled.match(action)) {
      // Error is shown via selectAuthError from Redux
    }
  };

  const loading = authStatus === 'loading';

  return (
    <div
      className="flex h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="theme-card-lg w-full max-w-md">
        <h2 className="theme-section-title mb-6 text-center">Please Sign In to Continue</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <input
              {...register('username')}
              autoComplete="username"
              className={`theme-input text-lg ${errors.username ? 'theme-input-error' : ''}`}
              placeholder="Email or username"
              aria-invalid={errors.username ? 'true' : 'false'}
            />
            {errors.username ? (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            ) : null}
          </div>
          <div>
            <PasswordField
              {...register('password')}
              error={errors.password?.message}
              className="[&_input]:theme-input [&_input]:text-lg"
              placeholder="Password"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="theme-btn-primary w-full py-3 text-lg disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          {authError ? <p className="text-sm text-red-600">{authError}</p> : null}
        </form>
        <p className="mt-6 text-center text-sm">
          Create an account?{' '}
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/Register')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/Register')}
            className="cursor-pointer font-semibold text-brand-orange underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
