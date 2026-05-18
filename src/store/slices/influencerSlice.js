import { createSlice } from '@reduxjs/toolkit';

const INFLUENCERS_KEY = 'adminInfluencers';

function readInfluencers() {
  try {
    const raw = localStorage.getItem(INFLUENCERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveInfluencers(list) {
  localStorage.setItem(INFLUENCERS_KEY, JSON.stringify(list));
}

const initialList = readInfluencers();
const initialState = {
  byId: initialList.reduce((acc, item) => ({ ...acc, [String(item.id)]: item }), {}),
  allIds: initialList.map((item) => String(item.id)),
};

const influencerSlice = createSlice({
  name: 'influencer',
  initialState,
  reducers: {
    addInfluencerLocal(state, action) {
      const influencer = action.payload;
      const id = String(influencer.id);
      state.byId[id] = influencer;
      if (!state.allIds.includes(id)) state.allIds.unshift(id);
      saveInfluencers(state.allIds.map((pid) => state.byId[pid]).filter(Boolean));
    },
    updateInfluencerStatusLocal(state, action) {
      const { id, status } = action.payload || {};
      const key = String(id);
      if (!state.byId[key]) return;
      state.byId[key] = { ...state.byId[key], status: status === 'inactive' ? 'inactive' : 'active' };
      saveInfluencers(state.allIds.map((pid) => state.byId[pid]).filter(Boolean));
    },
  },
});

export const { addInfluencerLocal, updateInfluencerStatusLocal } = influencerSlice.actions;
export default influencerSlice.reducer;
