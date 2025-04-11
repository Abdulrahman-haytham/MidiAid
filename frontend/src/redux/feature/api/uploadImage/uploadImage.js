import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const imgApi=createApi({
    reducerPath:'imgApi',
    baseQuery:fetchBaseQuery({
        baseUrl:'https://midiaid.onrender.com/api/auth',

    }),
    tagTypes:['data'],
    endpoints:(builder)=>({
        uploadImg:builder.mutation({
            query: (userData) => ({
                url:'/upload-status',
                method: 'POST',
                body: userData,
            }),
               invalidatesTags: ['data'],
          })
    })
})
export const  {useUploadImgMutation} = imgApi