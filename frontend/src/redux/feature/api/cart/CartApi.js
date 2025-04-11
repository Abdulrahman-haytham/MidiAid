import { createApi ,fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import Cookies from 'universal-cookie'
const cookies = new Cookies();
export const CartApi= createApi({
    reducerPath:'medicinesApi',
    baseQuery:fetchBaseQuery({
      // https://fakestoreapi.com/
        baseUrl:'https://midiaid.onrender.com/api/products/cart/',
          // set token to server
       prepareHeaders: (headers) => {
    
        const token = cookies.get("token");
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return headers;
  }
}),
    tagTypes:['data'],
    endpoints:(builder)=>({
            
      getFromFav: builder.query({
            query: ()=>`b`,
            providesTags: ['data'],
        }),

      addToFav: builder.mutation({
             query:(id)=>({
                url:id,
                method:'POST',
             }),
             invalidatesTags:['data'],
          }),
          

       

    }),
});
export const { useAddToFavMutation,
    useGetFromFavQuery,
    
 } = CartApi

