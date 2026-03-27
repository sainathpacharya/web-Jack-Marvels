import { createSlice } from '@reduxjs/toolkit';

const PROMOTERS_KEY = 'adminPromoters';

function readPromoters() {
  try {
    const raw = localStorage.getItem(PROMOTERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function savePromoters(list) {
  localStorage.setItem(PROMOTERS_KEY, JSON.stringify(list));
}

const initialList = readPromoters();
const initialState = {
  byId: initialList.reduce((acc, item) => ({ ...acc, [String(item.id)]: item }), {}),
  allIds: initialList.map((item) => String(item.id)),
};

const promoterSlice = createSlice({
  name: 'promoter',
  initialState,
  reducers: {
    addPromoterLocal(state, action) {
      const promoter = action.payload;
      const id = String(promoter.id);
      state.byId[id] = promoter;
      if (!state.allIds.includes(id)) state.allIds.unshift(id);
      savePromoters(state.allIds.map((pid) => state.byId[pid]).filter(Boolean));
    },
    updatePromoterStatusLocal(state, action) {
      const { id, status } = action.payload || {};
      const key = String(id);
      if (!state.byId[key]) return;
      state.byId[key] = { ...state.byId[key], status: status === 'inactive' ? 'inactive' : 'active' };
      savePromoters(state.allIds.map((pid) => state.byId[pid]).filter(Boolean));
    },
  },
});

export const { addPromoterLocal, updatePromoterStatusLocal } = promoterSlice.actions;
export default promoterSlice.reducer;
