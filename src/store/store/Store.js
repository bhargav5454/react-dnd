import { configureStore } from "@reduxjs/toolkit";
import { dataApi } from "../api/DataApi";

const Store = configureStore({
  reducer: {
    [dataApi.reducerPath]: dataApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(dataApi.middleware),
});

export default Store;
