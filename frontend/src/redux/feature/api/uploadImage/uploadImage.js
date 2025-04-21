import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const imgApi = createApi({
  reducerPath: 'imgApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://midiaid.onrender.com/api/',
    // شيل Content-Type نهائياً!
  }),
  tagTypes: ['data'],
  endpoints: (builder) => ({
    uploadImg: builder.mutation({
      query: (formData) => ({
        url: '/uploads',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['data'],
    }),
  }),
});

export const { useUploadImgMutation } = imgApi;
