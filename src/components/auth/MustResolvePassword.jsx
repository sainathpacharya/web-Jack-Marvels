import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectMustChangePassword } from '../../store/selectors/authSelectors';

/**
 * Sends authenticated users with a pending password change to /change-password.
 * Does not wrap public routes — place inside Router around protected subtrees or all Routes.
 */
export default function MustResolvePassword({ children }) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mustChangePassword = useAppSelector(selectMustChangePassword);

  if (isAuthenticated && mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace state={{ from: location }} />;
  }

  return children;
}
