import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface AISuggestion {
  suggested_reply: string;
  confidence: string;
  alternative_replies: string[];
  talking_points: string[];
}

interface AIState {
  searchResults: any[];
  parsedQuery: any;
  composeResult: {
    subject?: string;
    body?: string;
    personalization_notes?: string;
  } | null;
  transcriptionResult: any;
  churnPrediction: any;
  leadScore: any;
  suggestion: AISuggestion | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AIState = {
  searchResults: [],
  parsedQuery: null,
  composeResult: null,
  transcriptionResult: null,
  churnPrediction: null,
  leadScore: null,
  suggestion: null,
  isLoading: false,
  error: null,
};

export const searchNaturalLanguage = createAsyncThunk(
  'ai/search',
  async (query: string) => {
    const response = await api.post('/ai/search/', { query });
    return response.data;
  }
);

export const composeFollowUp = createAsyncThunk(
  'ai/compose',
  async ({ leadId, channel, tone }: { leadId: string; channel: string; tone: string }) => {
    const response = await api.post(`/ai/leads/${leadId}/compose/`, { channel, tone });
    return response.data;
  }
);

export const getChurnPrediction = createAsyncThunk(
  'ai/churn',
  async (leadId: string) => {
    const response = await api.post(`/ai/leads/${leadId}/churn/`);
    return response.data;
  }
);

export const getRealtimeSuggestion = createAsyncThunk(
  'ai/suggest',
  async (context: string) => {
    const response = await api.post('/ai/suggest/', { conversation_context: context });
    return response.data;
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIResults: (state) => {
      state.searchResults = [];
      state.composeResult = null;
      state.suggestion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchNaturalLanguage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchNaturalLanguage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.results;
        state.parsedQuery = action.payload.parsed_query;
      })
      .addCase(composeFollowUp.fulfilled, (state, action) => {
        state.composeResult = action.payload;
      })
      .addCase(getChurnPrediction.fulfilled, (state, action) => {
        state.churnPrediction = action.payload;
      })
      .addCase(getRealtimeSuggestion.fulfilled, (state, action) => {
        state.suggestion = action.payload;
      });
  },
});

export const { clearAIResults } = aiSlice.actions;
export default aiSlice.reducer;
