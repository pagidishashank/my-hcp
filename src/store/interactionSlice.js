import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:8000';

// Async thunk for submitting the structured form
export const addInteractionAsync = createAsyncThunk(
  'interaction/addInteraction',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save interaction');
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk for sending chat messages to the AI agent
export const chatInteractionAsync = createAsyncThunk(
  'interaction/chatInteraction',
  async (chatPayload, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload),
      });
      if (!response.ok) throw new Error('Chat request failed');
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk for fetching all interactions
export const fetchInteractions = createAsyncThunk(
  'interaction/fetchInteractions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/interactions`);
      if (!response.ok) throw new Error('Failed to fetch interactions');
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const interactionSlice = createSlice({
  name: 'interaction',
  initialState: {
    formData: {
      hcp_name: '',
      interaction_type: 'Meeting',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      attendees: '',
      notes: '',
      samples_distributed: '',
      sentiment: 'Neutral',
      outcomes: '',
      follow_up_actions: '',
    },
    chatMessages: [],
    interactions: [],
    isLoading: false,
    isChatLoading: false,
    error: null,
  },
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    updateAllFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    setAgentLoading: (state, action) => {
      state.isChatLoading = action.payload;
    },
    resetForm: (state) => {
      state.formData = {
        hcp_name: '',
        interaction_type: 'Meeting',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        attendees: '',
        notes: '',
        samples_distributed: '',
        sentiment: 'Neutral',
        outcomes: '',
        follow_up_actions: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Interaction
      .addCase(addInteractionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addInteractionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interactions.push(action.payload);
      })
      .addCase(addInteractionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Chat Interaction
      .addCase(chatInteractionAsync.pending, (state) => {
        state.isChatLoading = true;
      })
      .addCase(chatInteractionAsync.fulfilled, (state, action) => {
        state.isChatLoading = false;
      })
      .addCase(chatInteractionAsync.rejected, (state, action) => {
        state.isChatLoading = false;
        state.error = action.payload;
      })
      // Fetch Interactions
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.interactions = action.payload;
      });
  },
});

export const {
  updateFormField,
  updateAllFormData,
  addChatMessage,
  setAgentLoading,
  resetForm,
} = interactionSlice.actions;

export default interactionSlice.reducer;
