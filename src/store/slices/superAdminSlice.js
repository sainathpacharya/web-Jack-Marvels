import { createSlice } from '@reduxjs/toolkit';
import { STATIC_PROMO_CODES, STATIC_SPONSORS } from '../../data/staticData';

const initialState = {
  sponsors: [...STATIC_SPONSORS],
  videoBytes: [],
  promoCodes: [...STATIC_PROMO_CODES],
};

const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState,
  reducers: {
    addSponsorLocal(state, action) {
      state.sponsors.push(action.payload);
    },
    addVideoByteLocal(state, action) {
      state.videoBytes.push(action.payload);
    },
    addPromoCodeLocal(state, action) {
      state.promoCodes.push(action.payload);
    },
  },
});

export const { addSponsorLocal, addVideoByteLocal, addPromoCodeLocal } = superAdminSlice.actions;
export default superAdminSlice.reducer;
