import { configureStore } from "@reduxjs/toolkit";
import dataSlice from "../slice/DataSlice";
import { dataApi } from "../api/DataApi";

const Store = configureStore({
  reducer: {
    data: dataSlice,
    [dataApi.reducerPath]: dataApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(dataApi.middleware),
});

export default Store;
