import { createSlice } from "@reduxjs/toolkit";




const initialState={
    user:null,
    token: localStorage.getItem("token") || null,
};


const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        setUser:(state,action) => {
            state.user= action.payload.user;
            state.token= action.payload.token;
            localStorage.setItem("token",action.payload.token);
        },
        logout:(state) => {
            state.user=null;
            state.token= null;
            localStorage.removeItemo("token");
        },
    }

})
export const {setUser,logout}=authSlice.actions;
export default authSlice.reducer;
// هذا الكود يخزن بيانات المستخدم بعد تسجيل الدخول ويحفظ التوكن في LocalStorage.
