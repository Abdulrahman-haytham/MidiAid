import { createApi ,fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const medicinesApi= createApi({
    reducerPath:'medicinesApi',
    baseQuery:fetchBaseQuery({
      // https://fakestoreapi.com/
        baseUrl:'https://midiaid.onrender.com/api/products/',
          // set token to server
       prepareHeaders: (headers) => {    
          const token = cookies.get("token");
             console.log(token);
  
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}),
    tagTypes:['data'],
    endpoints:(builder)=>({
      getProData: builder.query({
        query: () => {
          console.log("Fetching data from API...");
          return 'products'; // تأكد من أن المسار صحيح
        },
        providesTags: ['data'],
      }),
       
          getById: builder.query({
            query: (id) => `products/${id}`,
            providesTags: ['data'],
          }),
          deleteById: builder.mutation({
             query:(id)=>({
                url:id,
                method:'DELETE',
             }),
             invalidatesTags:['data'],
          }),
          
          getProSearchByName: builder.query({
            query: (name)=>`products/${name}`,
            providesTags: ['data'],
        }),

       

    }),
});
export const { useGetProDataQuery,
    useGetByIdQuery,
    useDeleteByIdMutation,
 } = medicinesApi;

