import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLE_IDS } from '../auth/session';
import { useAppSelector } from '../store/hooks';
import { selectRoleId } from '../store/selectors/authSelectors';

export default function RoleGuard({ allow = [], children }) {
  const roleId = useAppSelector(selectRoleId);

  if (Number(roleId) === ROLE_IDS.STUDENT) {
    return <Navigate to="/web-access-blocked" replace />;
  }

  if (!allow.includes(roleId)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
