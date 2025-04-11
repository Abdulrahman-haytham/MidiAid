import { createSlice } from "@reduxjs/toolkit";

export const ProductsSlice=createSlice({
    name:'products',
    initialState:{
        form:[]
    },
    reducers:{
        filterProducts:(state,action)=>{
            state.form = action.payload;
        }
    }
})
export const {filterProducts} = ProductsSlice.actions;
export default ProductsSlice.reducer;