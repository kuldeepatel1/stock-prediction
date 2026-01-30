import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCompanies, fetchHistoricalData, fetchCurrentPrice } from '../services/api';

// Async thunks for stock data
export const getCompanies = createAsyncThunk(
  'stocks/getCompanies',
  async () => {
    const response = await fetchCompanies();
    return response;
  }
);

export const getHistoricalData = createAsyncThunk(
  'stocks/getHistoricalData',
  async (ticker) => {
    const response = await fetchHistoricalData(ticker);
    return { ticker, data: response };
  }
);

export const getCurrentPrice = createAsyncThunk(
  'stocks/getCurrentPrice',
  async (ticker) => {
    const response = await fetchCurrentPrice(ticker);
    return { ticker, data: response };
  }
);

const initialState = {
  companies: [],
  selectedCompany: {
    ticker: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd',
  },
  historicalData: {},
  currentPrices: {},
  searchTerm: '',
  loading: false,
  error: null,
};

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    setSelectedCompany: (state, action) => {
      state.selectedCompany = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearHistoricalData: (state, action) => {
      if (action.payload) {
        delete state.historicalData[action.payload];
      } else {
        state.historicalData = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Companies
      .addCase(getCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(getCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      // Historical Data
      .addCase(getHistoricalData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHistoricalData.fulfilled, (state, action) => {
        state.loading = false;
        state.historicalData[action.payload.ticker] = action.payload.data;
      })
      .addCase(getHistoricalData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch historical data';
      })
      // Current Price
      .addCase(getCurrentPrice.fulfilled, (state, action) => {
        state.currentPrices[action.payload.ticker] = action.payload.data;
      });
  },
});

export const { setSelectedCompany, setSearchTerm, clearHistoricalData } = stocksSlice.actions;

// Selectors
export const selectCompanies = (state) => state.stocks.companies;
export const selectSelectedCompany = (state) => state.stocks.selectedCompany;
export const selectHistoricalData = (state) => state.stocks.historicalData;
export const selectCurrentPrices = (state) => state.stocks.currentPrices;
export const selectSearchTerm = (state) => state.stocks.searchTerm;
export const selectLoading = (state) => state.stocks.loading;
export const selectError = (state) => state.stocks.error;

// Filter companies by search term
export const selectFilteredCompanies = (state) => {
  const term = state.stocks.searchTerm.toLowerCase();
  return state.stocks.companies.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.ticker.toLowerCase().includes(term)
  );
};

export default stocksSlice.reducer;

