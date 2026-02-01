
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    loading: false,
};

export const agreementsSlice = createSlice({
    name: 'agreements',
    initialState,
    reducers: {},
});

export default agreementsSlice.reducer;
