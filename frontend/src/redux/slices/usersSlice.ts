import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'worker' | 'client' | 'admin';
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    verification: 'verified' | 'pending' | 'under_review';
    joinedDate: string;
    avatar?: string;
    phone?: string;
}

interface UsersState {
    items: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    items: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async () => {
        const response = await api.get('/admin/users');
        return response.data;
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData: Partial<User>) => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }: { id: string; userData: Partial<User> }) => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    }
);

export const updateUserStatus = createAsyncThunk(
    'users/updateUserStatus',
    async ({ userId, status }: { userId: string; status: User['status'] }) => {
        const response = await api.patch(`/admin/users/${userId}/status`, { status });
        return response.data;
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId: string) => {
        await api.delete(`/admin/users/${userId}`);
        return userId;
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })
            // Create user
            .addCase(createUser.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update user
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.items.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload };
                }
            })
            // Update user status
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.items[index].status = action.payload.status;
                }
            })
            // Delete user
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.items = state.items.filter(user => user.id !== action.payload);
            });
    },
});

export default usersSlice.reducer;
