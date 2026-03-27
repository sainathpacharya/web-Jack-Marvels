import { createSelector } from 'reselect';

const selectAppState = (state) => state.app;

export const selectGlobalLoadingCount = createSelector([selectAppState], (app) => app.globalLoadingCount);
export const selectIsGlobalLoading = createSelector([selectGlobalLoadingCount], (count) => count > 0);
export const selectGlobalError = createSelector([selectAppState], (app) => app.lastError);
