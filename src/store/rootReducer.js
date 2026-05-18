import { combineReducers } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import promoterReducer from './slices/promoterSlice';
import influencerReducer from './slices/influencerSlice';
import superAdminReducer from './slices/superAdminSlice';

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  events: eventsReducer,
  promoter: promoterReducer,
  influencer: influencerReducer,
  superAdmin: superAdminReducer,
});

export default rootReducer;
