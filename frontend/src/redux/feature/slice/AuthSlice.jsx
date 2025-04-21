import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'universal-cookie'

const cookies= new Cookies()

const initialState={
    user:null,
    token: cookies.get("token") || null,
};


const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        setUser:(state,action) => {
            state.user= action.payload.user;
            state.token= action.payload.token;
            cookies.set("token",action.payload.token);
        },
        logout:(state) => {
            state.user=null;
            state.token= null;
            cookies.remove("token");
        },
    }

})
export const {setUser,logout}=authSlice.actions;
export default authSlice.reducer;
// هذا الكود يخزن بيانات المستخدم بعد تسجيل الدخول ويحفظ التوكن في LocalStorage.
