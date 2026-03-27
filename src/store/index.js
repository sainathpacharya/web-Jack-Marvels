import { configureStore, isPending, isRejected } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setGlobalError, startGlobalLoading, stopGlobalLoading } from './slices/appSlice';

const globalStatusMiddleware = (storeApi) => (next) => (action) => {
  if (isPending(action)) {
    storeApi.dispatch(startGlobalLoading());
  }

  if (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) {
    storeApi.dispatch(stopGlobalLoading());
  }

  if (isRejected(action)) {
    storeApi.dispatch(setGlobalError(action.payload || action.error?.message || 'Something went wrong.'));
  }

  return next(action);
};

const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(globalStatusMiddleware),
});

export default store;
