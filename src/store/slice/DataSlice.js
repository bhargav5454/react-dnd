// src/slices/dataSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { dataApi } from "../api/DataApi";

const initialState = {
  data: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      dataApi.endpoints.fetchData.matchFulfilled,
      (state, action) => {
        state.data = action.payload;
      }
    );
    builder.addMatcher(
      dataApi.endpoints.updateData.matchRejected,
      (state, action) => {
        state.data = state.data.map((data) =>
          data.id === action.payload.id ? action.payload : data
        );
      }
    );
  },
});

export default dataSlice.reducer;
