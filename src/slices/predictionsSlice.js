import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPrediction } from '../services/api';

// Async thunk for predictions
export const getPrediction = createAsyncThunk(
  'predictions/getPrediction',
  async ({ ticker, year, month, day }) => {
    const response = await fetchPrediction(ticker, year, month, day);
    return response;
  }
);

const initialState = {
  selectedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  predictions: {},
  loading: false,
  error: null,
};

const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    clearPrediction: (state, action) => {
      if (action.payload) {
        delete state.predictions[action.payload];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrediction.fulfilled, (state, action) => {
        state.loading = false;
        const key = `${action.payload.ticker}_${action.payload.year}_${action.payload.month}_${action.payload.day}`;
        state.predictions[key] = action.payload;
      })
      .addCase(getPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prediction';
      });
  },
});

export const { setSelectedDate, clearPrediction } = predictionsSlice.actions;

// Selectors
export const selectSelectedDate = (state) => state.predictions.selectedDate;
export const selectPredictions = (state) => state.predictions.predictions;
export const selectPredictionsLoading = (state) => state.predictions.loading;
export const selectPredictionsError = (state) => state.predictions.error;

export const selectPredictionByKey = (state, key) => state.predictions.predictions[key];

export default predictionsSlice.reducer;

