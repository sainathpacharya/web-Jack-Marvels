import { createSelector } from 'reselect';

const selectAuthState = (state) => state.auth;

export const selectAuthStatus = createSelector([selectAuthState], (auth) => auth.status);
export const selectAuthError = createSelector([selectAuthState], (auth) => auth.error);
export const selectRegisterStatus = createSelector([selectAuthState], (auth) => auth.registerStatus);
export const selectRegisterError = createSelector([selectAuthState], (auth) => auth.registerError);
export const selectIsAuthenticated = createSelector([selectAuthState], (auth) => auth.isAuthenticated);
export const selectAuthUser = createSelector([selectAuthState], (auth) => auth.user);
export const selectRoleId = createSelector([selectAuthState], (auth) => auth.roleId);
export const selectRoleName = createSelector([selectAuthState], (auth) => auth.roleName);
export const selectMustChangePassword = createSelector(
  [selectAuthState],
  (auth) => Boolean(auth.mustChangePassword)
);
