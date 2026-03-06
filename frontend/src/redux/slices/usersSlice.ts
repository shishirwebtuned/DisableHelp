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
    phoneNumber?: string;
    address?: string
}

interface SelectedUser {
    user: any;
    profile?: any;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface UsersState {
    items: User[];
    pagination: Pagination;
    selectedUser: SelectedUser | null;
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    items: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    selectedUser: null,
    loading: false,
    error: null,
};

// Async thunks

const baseapi = "users";
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (params: { search?: string; role?: string; status?: string; page?: number; limit?: number } | undefined) => {
        const response = await api.get(`${baseapi}/all`, { params });
        return { users: response.data.data.users, pagination: response.data.data.pagination };
    }
);

export const createAdmin = createAsyncThunk(
    'users/createAdmin',
    async (adminData: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/users/create-admin', adminData);
            return response.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to create admin';
            return rejectWithValue(message);
        }
    }
);

export const getuserbyid = createAsyncThunk(
    'users/getById',
    async (id: string) => {
        // GET /users/:id -> returns { user, profile }
        const response = await api.get(`${baseapi}/${id}`);
        return response.data.data; // expected shape: { user, profile }
    }
);


export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }: { id: string; userData: Partial<User> }) => {
        const response = await api.put(`${baseapi}/${id}`, userData);
        return response.data;
    }
);

export const updateUserStatus = createAsyncThunk(
    'users/updateUserStatus',
    async ({ userId, status }: { userId: string; status: User['status'] }) => {
        const response = await api.patch(`${baseapi}/${userId}/status`, { status });
        return response.data;
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId: string) => {
        await api.delete(`${baseapi}/${userId}`);
        return userId;
    }
);

export const approveUser = createAsyncThunk(
    'users/approveUser',
    async ({ userId, approved }: { userId: string; approved: boolean }, { rejectWithValue }) => {
        try {

            const response = await api.patch(`/admin/approve/${userId}`, { approved });
       
            return response.data.data;
        
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to update verification status';
            return rejectWithValue(message);
        }
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
                state.items = action.payload.users;
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })
            // Create admin
            .addCase(createAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload.data || action.payload);
            })
            .addCase(createAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to create admin';
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
            })
            // Get user by id
            .addCase(getuserbyid.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedUser = null;
            })
            .addCase(getuserbyid.fulfilled, (state, action) => {
                state.loading = false;
                // action.payload expected { user, profile }
                state.selectedUser = action.payload;
            })
            .addCase(getuserbyid.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch user by id';
                state.selectedUser = null;
            })
            // Approve user
            .addCase(approveUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveUser.fulfilled, (state, action) => {
                state.loading = false;
                // action.payload may be the updated user object or an object containing { user }
                const updated = (action.payload && (action.payload.user || action.payload)) as any;
                if (!updated) return;

                // normalize id
                const updatedId = updated.id || updated._id || null;

                // Update selectedUser.user if it exists
                if (state.selectedUser?.user) {
                    // merge to preserve profile
                    state.selectedUser.user = { ...state.selectedUser.user, ...updated };
                }

                // Also update in items array if present
                const index = state.items.findIndex(u => u.id === updatedId || (u as any)._id === updatedId);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...updated } as any;
                }
            })
            .addCase(approveUser.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to update verification status';
            });
    },
});

export default usersSlice.reducer;
