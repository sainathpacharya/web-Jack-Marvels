import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAuthenticatedEvents, fetchPublicEvents } from '../../services/eventsService';

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async ({ audience = 'public' } = {}, { rejectWithValue, signal }) => {
    try {
      if (audience === 'authenticated') {
        return await fetchAuthenticatedEvents({ signal });
      }
      return await fetchPublicEvents({ signal });
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to load events');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.events = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to load events';
      });
  },
});

export default eventsSlice.reducer;

