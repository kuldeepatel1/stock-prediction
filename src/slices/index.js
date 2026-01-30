import { configureStore } from '@reduxjs/toolkit';
import stocksReducer from './stocksSlice';
import userReducer from './userSlice';
import predictionsReducer from './predictionsSlice';
import favoritesReducer from './favoritesSlice';

export const store = configureStore({
  reducer: {
    stocks: stocksReducer,
    user: userReducer,
    predictions: predictionsReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

