import { createSlice } from '@reduxjs/toolkit';

const MedicinetoPhaSlice = createSlice({
  name: 'search',
  initialState: {
    form: [], // تهيئة الحالة الأولية كمصفوفة فارغة
  },
  reducers: {
    setMedicineToPh: (state, action) => {
      state.form = action.payload; // تعيين المصفوفة بالكامل
    },
    addMedicine: (state, action) => {
      state.form.push(action.payload); // إضافة كائن جديد إلى المصفوفة
    },
    removeMedicine: (state, action) => {
      state.form = state.form.filter((_, index) => index !== action.payload); // إزالة الكائن بناءً على الفهرس
    },
    updateMedicine: (state, action) => {
      const { index, medicine } = action.payload;
      state.form[index] = medicine; // تحديث الكائن في الفهرس المحدد
    },
  },
});

export const { setMedicineToPh, addMedicine, removeMedicine, updateMedicine } = MedicinetoPhaSlice.actions;
export default MedicinetoPhaSlice.reducer;
