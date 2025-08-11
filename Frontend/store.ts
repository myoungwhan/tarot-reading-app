import { configureStore } from '@reduxjs/toolkit';
import { tarotApi } from '@/services/api';

export const store = configureStore({
  reducer: {
    [tarotApi.reducerPath]: tarotApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tarotApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
