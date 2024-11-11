import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../lib/axios";

export const dataApi = createApi({
  reducerPath: "dataApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Data"],
  endpoints: (builder) => ({
    fetchData: builder.query({
      query: () => ({
        url: "/data",
        method: "GET",
      }),
      providesTags: ["Data"],
    }),
    updateData: builder.mutation({
      query: (data) => ({
        url: `/data/items/${data?.id}`,
        method: "PUT",
        data,
      }),
      providesTags: ["Data"],
    }),
  }),
});

export const { useFetchDataQuery, useUpdateDataMutation } = dataApi;
