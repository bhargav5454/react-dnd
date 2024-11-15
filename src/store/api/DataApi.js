import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../lib/axios";

export const dataApi = createApi({
  reducerPath: "dataApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Data"],
  endpoints: (builder) => ({
    fetchData: builder.query({
      query: () => ({
        url: "/get",
        method: "GET",
      }),
      providesTags: ["Data"],
    }),
    updateData: builder.mutation({
      query: (data) => ({
        url: `/order-change`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Data"],
    }),
    updateIndex: builder.mutation({
      query: (data) => ({
        url: `/update-index`,
        method: "POST",
        data,
      }),
      providesTags: ["Data"],
    }),
    addNewColumn: builder.mutation({
      query: (data) => ({
        url: `/add-new-column`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Data"],
    }),
    addNewCard: builder.mutation({
      query: (data) => ({
        url: `/add-new-card`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Data"],
    }),
  }),
});

export const {
  useFetchDataQuery,
  useUpdateDataMutation,
  useUpdateIndexMutation,
  useAddNewColumnMutation,
  useAddNewCardMutation,
} = dataApi;
