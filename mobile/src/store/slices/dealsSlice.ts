import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Deal {
  id: string;
  name: string;
  stage: string;
  value: string;
  probability: number;
  ai_win_probability: number | null;
  ai_next_best_action: string;
  expected_close_date: string | null;
  created_at: string;
}

interface DealsState {
  items: Deal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DealsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchDeals = createAsyncThunk('deals/fetchDeals', async () => {
  const response = await api.get('/deals/');
  return response.data.results || response.data;
});

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch deals';
      });
  },
});

export default dealsSlice.reducer;
