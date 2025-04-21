import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../feature/api/authApi";
import authReducer from '../feature/slice/AuthSlice'
import SearchReducer from '../feature/slice/SearchSlice.jsx'
import { api } from "../feature/api/Api";
import  MedicinetoPhaReducer  from "../feature/slice/MedicinetoPhaSlice.jsx";
import filterProductsReducer  from "../feature/slice/ProductsSlice.jsx";
import { imgApi } from "../feature/api/uploadImage/uploadImage.js";
export const store =  configureStore({
    reducer:{
       
        [api.reducerPath]: api.reducer,
        [authApi.reducerPath]:authApi.reducer,
        [imgApi.reducerPath]:imgApi.reducer,
        search: SearchReducer,
        medicineToPh: MedicinetoPhaReducer,
        auth:authReducer,
        filterPro:filterProductsReducer
    },
    middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(
       
        api.middleware,
        authApi.middleware,
        imgApi.middleware,
      
       
    ),
});
