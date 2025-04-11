import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import Cookies from "universal-cookie";
const cookies= new Cookies();
export const usersApi=createApi({
    reducerPath:'usersApi',
    baseQuery:fetchBaseQuery({
        baseUrl:'https://midiaid.onrender.com/api/auth',
        prepareHeaders:(headers)=> {
            const token= cookies.get('token');
            if(token){
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers
        }
     }),
    tagTypes:['data'],
    endpoints:(builder)=>({
        getUsers: builder.query({
            getData: builder.query({
                query: (category) =>`users${category ? `?category=${category}` : ''}`,
                
                // يقوم باستدعاء التاغ وعمل ريلود للصفحه
                providesTags: ['data'],
              }),
        })
    })

})