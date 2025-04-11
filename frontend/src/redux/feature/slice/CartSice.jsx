import { createSlice } from "@reduxjs/toolkit";

export const CartSlice = createSlice({
    name: 'cart',
    initialState: [],
    reducers: {
        addItem: (state, action) => {
            state.push(action.payload);
        },
        removeItem: (state, action) => {
            return state.filter(item => item.id !== action.payload.id);
        },
        clearCart: () => {
            return [];
        }
    }
});

export const { addItem, removeItem, clearCart } = CartSlice.actions;
export default CartSlice.reducer;
