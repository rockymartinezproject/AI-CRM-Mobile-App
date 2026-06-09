import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  status: string;
  source: string;
  priority: number;
  ai_score: number | null;
  ai_churn_risk: number | null;
  estimated_value: string | null;
  owner: string | null;
  owner_name: string;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface LeadsState {
  items: Lead[];
  selectedLead: Lead | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  items: [],
  selectedLead: null,
  isLoading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params?: Record<string, any>) => {
    const response = await api.get('/leads/', { params });
    return response.data.results || response.data;
  }
);

export const fetchLeadDetail = createAsyncThunk(
  'leads/fetchLeadDetail',
  async (id: string) => {
    const response = await api.get(`/leads/${id}/`);
    return response.data;
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (data: Partial<Lead>) => {
    const response = await api.post('/leads/', data);
    return response.data;
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }: { id: string; data: Partial<Lead> }) => {
    const response = await api.patch(`/leads/${id}/`, data);
    return response.data;
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      })
      .addCase(fetchLeadDetail.fulfilled, (state, action) => {
        state.selectedLead = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.items.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedLead?.id === action.payload.id) {
          state.selectedLead = action.payload;
        }
      });
  },
});

export const { clearSelectedLead } = leadsSlice.actions;
export default leadsSlice.reducer;
