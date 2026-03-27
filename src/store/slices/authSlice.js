import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  login as loginApi,
  logoutFromServer,
  registerUser,
  changePassword as changePasswordApi,
  clearMustChangePasswordInSession,
} from '../../api/auth';
import { deriveMustChangePassword } from '../../auth/passwordFlags';
import {
  ROLE_IDS,
  clearSession,
  getAccessToken,
  getCurrentUser,
  getRefreshToken,
  setSession,
} from '../../auth/session';

function extractUser(auth) {
  return auth?.me ?? auth?.user ?? auth?.profile ?? auth ?? null;
}

function extractTokens(auth, user) {
  return {
    accessToken:
      auth?.accessToken ??
      auth?.token ??
      auth?.access_token ??
      user?.accessToken ??
      user?.token ??
      user?.access_token ??
      '',
    refreshToken:
      auth?.refreshToken ??
      auth?.refresh_token ??
      user?.refreshToken ??
      user?.refresh_token ??
      '',
  };
}

const initialUser = getCurrentUser();
const initialState = {
  user: initialUser,
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  roleId: Number(initialUser?.roleId ?? initialUser?.role_id ?? 0) || null,
  roleName: initialUser?.roleName ?? initialUser?.role ?? '',
  isAuthenticated: Boolean(getAccessToken()),
  mustChangePassword: deriveMustChangePassword(initialUser, {}),
  status: 'idle',
  registerStatus: 'idle',
  registerError: null,
  error: null,
  changePasswordStatus: 'idle',
  changePasswordError: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const auth = await loginApi({ username: username.trim(), password });
      const user = extractUser(auth);
      const mustChangePassword = deriveMustChangePassword(user, auth);
      const userForStorage = {
        ...user,
        role: user?.roleName,
        mustChangePassword,
      };
      const roleId = Number(userForStorage?.roleId ?? userForStorage?.role_id ?? 0) || null;
      if (roleId === ROLE_IDS.STUDENT) {
        clearSession();
        return rejectWithValue('Student accounts do not have access to the web application.');
      }

      const tokens = extractTokens(auth, userForStorage);
      setSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, me: userForStorage });
      localStorage.setItem('user', JSON.stringify(userForStorage));
      return {
        user: userForStorage,
        roleId,
        roleName: userForStorage?.roleName ?? userForStorage?.role ?? '',
        mustChangePassword,
        ...tokens,
      };
    } catch (error) {
      return rejectWithValue(error?.message || 'Something went wrong. Please try again later.');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutFromServer();
    return true;
  } catch (error) {
    clearSession();
    return rejectWithValue(error?.message || 'Logout failed.');
  }
});

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await changePasswordApi({ currentPassword, newPassword });
      clearMustChangePasswordInSession();
      return true;
    } catch (error) {
      return rejectWithValue(error?.message || 'Password change failed.');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const result = await registerUser(payload);
      return result;
    } catch (error) {
      return rejectWithValue(error?.message || 'Registration failed.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth(state) {
      const user = getCurrentUser();
      state.user = user;
      state.accessToken = getAccessToken();
      state.refreshToken = getRefreshToken();
      state.roleId = Number(user?.roleId ?? user?.role_id ?? 0) || null;
      state.roleName = user?.roleName ?? user?.role ?? '';
      state.isAuthenticated = Boolean(state.accessToken);
      state.mustChangePassword = deriveMustChangePassword(user, {});
    },
    clearAuthState(state) {
      state.user = null;
      state.accessToken = '';
      state.refreshToken = '';
      state.roleId = null;
      state.roleName = '';
      state.isAuthenticated = false;
      state.mustChangePassword = false;
      state.status = 'idle';
      state.error = null;
      state.registerStatus = 'idle';
      state.registerError = null;
      state.changePasswordStatus = 'idle';
      state.changePasswordError = null;
    },
    upsertAuthUser(state, action) {
      if (!action.payload) return;
      state.user = {
        ...(state.user || {}),
        ...action.payload,
      };
      state.roleId = Number(state.user?.roleId ?? state.user?.role_id ?? 0) || null;
      state.roleName = state.user?.roleName ?? state.user?.role ?? '';
      state.mustChangePassword = deriveMustChangePassword(state.user, {});
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.user = action.payload.user;
        state.roleId = action.payload.roleId;
        state.roleName = action.payload.roleName;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.mustChangePassword = Boolean(action.payload.mustChangePassword);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Login failed';
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = '';
        state.refreshToken = '';
        state.roleId = null;
        state.roleName = '';
        state.isAuthenticated = false;
        state.mustChangePassword = false;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = '';
        state.refreshToken = '';
        state.roleId = null;
        state.roleName = '';
        state.isAuthenticated = false;
        state.mustChangePassword = false;
      })
      .addCase(registerThunk.pending, (state) => {
        state.registerStatus = 'loading';
        state.registerError = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.registerStatus = 'succeeded';
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.registerError = action.payload || action.error.message || 'Registration failed.';
      })
      .addCase(changePasswordThunk.pending, (state) => {
        state.changePasswordStatus = 'loading';
        state.changePasswordError = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.changePasswordStatus = 'succeeded';
        state.changePasswordError = null;
        state.mustChangePassword = false;
        state.user = getCurrentUser();
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.changePasswordStatus = 'failed';
        state.changePasswordError = action.payload || action.error.message || 'Password change failed.';
      });
  },
});

export const { hydrateAuth, clearAuthState, upsertAuthUser } = authSlice.actions;
export default authSlice.reducer;
