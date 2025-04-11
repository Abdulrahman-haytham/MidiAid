import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const categoriesApi = createApi({
    reducerPath: 'categoriesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://midiaid.onrender.com/api/',
        prepareHeaders: (headers) => {
            const token = cookies.get("token");
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`); 
            }
            return headers;
        }
    }),
    tagTypes: ['data'],
    endpoints: (builder) => ({
      getData: builder.query({
          query: (url) => `${url}`,
          providesTags: ['data'],
      }),
      getById: builder.query({
          query: (id) => `${id}`,
          providesTags: ['data'],
      }),
      getSearchByName: builder.query({
          query: (url) => `${url}`,
          providesTags: ['data'],
      }),
      getSearch: builder.query({
          query: (url) => `${url}`,
          providesTags: ['data'],
      }),
      getFromFav: builder.query({
          query: () => `products/favorites/get`,
          providesTags: ['data'],
      }),
      addToFav: builder.mutation({
          query: (id) => ({
              url: `products/favorites/${id}`,
              method: 'POST',
          }),
          invalidatesTags: ['data'],
      }),
    //   removeFromFav: builder.mutation({
    //     query: (id) => ({
    //         url: `products/favorites/${id}`,
    //         method: 'POST',
    //     }),
    //     invalidatesTags: ['data'],
    // }),
      addOrder: builder.mutation({
          query: () => ({
              url: 'orders/create',
              method: 'POST',
          }),
          invalidatesTags: ['data'],
      }),
      getOrders: builder.query({
          query: () => 'orders/pharmacy-orders',
          providesTags: ['data'],
      }),
      addToCart: builder.mutation({
          query: (userData) => ({
              url: 'cart/add',
              method: 'POST',
              body: userData,
          }),
          invalidatesTags: ['data'],
      }),
      getFromCart: builder.query({
          query: () => ({
              url: 'cart/',
              method: 'GET',
          }),
          providesTags: ['data'],
      }),
      removeFromCart: builder.mutation({
          query: (id) => ({
              url: `cart/remove/${id}`,
              method: 'DELETE',
          }),
          invalidatesTags: ['data'],
      }),
      updateQuanCart: builder.mutation({
        query: ({id,userData}) => ({
            url: `cart/update/${id}`,
            method: 'PUT',
            body:userData,
        }),
        invalidatesTags: ['data'],
    }),
      createMyParmacy: builder.mutation({
          query: (userData) => ({
              url: `pharmacies/`,
              method: 'POST',
              body: userData,
          }),
          invalidatesTags: ['data'],
      }),
  }),
  
});

export const { useGetDataQuery ,
  useGetByIdQuery,
  useGetSearchByNameQuery,
  useAddToFavMutation,
  useGetFromFavQuery,
  useAddOrderMutation,
  useGetOrdersQuery,
  useGetSearchQuery,
  useAddToCartMutation,
  useGetFromCartQuery,
  useRemoveFromCartMutation,
  useCreateMyParmacyMutation,
  useUpdateQuanCartMutation
} = categoriesApi;