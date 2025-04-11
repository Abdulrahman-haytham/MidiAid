import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    searchTerm: '',
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
});

// ✅ تصدير Action و Reducer
export const { setSearchTerm } = searchSlice.actions;
export default searchSlice.reducer;
