import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  globalLoadingCount: 0,
  lastError: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    startGlobalLoading(state) {
      state.globalLoadingCount += 1;
    },
    stopGlobalLoading(state) {
      state.globalLoadingCount = Math.max(0, state.globalLoadingCount - 1);
    },
    setGlobalError(state, action) {
      state.lastError = action.payload || null;
    },
    clearGlobalError(state) {
      state.lastError = null;
    },
  },
});

export const { startGlobalLoading, stopGlobalLoading, setGlobalError, clearGlobalError } = appSlice.actions;

export default appSlice.reducer;
