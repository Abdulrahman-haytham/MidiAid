import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../feature/api/authApi";
import { medicinesApi } from "../feature/api/medicine/medicinesApi";
import authReducer from '../feature/slice/AuthSlice'
import SearchReducer from '../feature/slice/SearchSlice.jsx'
import { categoriesApi } from "../feature/api/categories/categoriesApi";
import { favApi } from "../feature/api/favourite/favApi";
import  MedicinetoPhaReducer  from "../feature/slice/MedicinetoPhaSlice.jsx";
import filterProductsReducer  from "../feature/slice/ProductsSlice.jsx";
export const store =  configureStore({
    reducer:{
        [medicinesApi.reducerPath]: medicinesApi.reducer,
        [categoriesApi.reducerPath]: categoriesApi.reducer,
        [authApi.reducerPath]:authApi.reducer,
        [favApi.reducerPath]: favApi.reducer,
        search: SearchReducer,
        medicineToPh: MedicinetoPhaReducer,
        auth:authReducer,
        filterPro:filterProductsReducer
    },
    middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(
        medicinesApi.middleware,
        categoriesApi.middleware,
        authApi.middleware,
        favApi.middleware
       
    ),
});
