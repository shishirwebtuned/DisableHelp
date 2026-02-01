
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    conversations: [],
    loading: false,
};

export const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {},
});

export default messagesSlice.reducer;
