import { createSlice } from '@reduxjs/toolkit';

const MedicinetoPhaSlice = createSlice({
  name: 'search',
  initialState: {
    form: [], 
  },
  reducers: {
    setMedicineToPh: (state, action) => {
      state.form = action.payload;
    },
    addMedicine: (state, action) => {
      state.form.push(action.payload);
    },
    removeMedicine: (state, action) => {
      state.form = state.form.filter((_, index) => index !== action.payload); 
    },
    updateMedicine: (state, action) => {
      const { index, medicine } = action.payload;
      state.form[index] = medicine; 
    },
  },
});

export const { setMedicineToPh, addMedicine, removeMedicine, updateMedicine } = MedicinetoPhaSlice.actions;
export default MedicinetoPhaSlice.reducer;
