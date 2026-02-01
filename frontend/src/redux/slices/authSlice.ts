import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'worker' | 'client';
    avatar?: string;
    isVerified: boolean;
    status: 'active' | 'pending' | 'suspended';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Mock async thunk
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: any, { rejectWithValue }) => {
        try {
            // API call would go here
            // const response = await api.post('/login', credentials);
            // return response.data;

            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (credentials.email === 'support@example.com') {
                return {
                    id: 'u1',
                    name: 'Sarah Worker',
                    email: 'support@example.com',
                    role: 'worker',
                    isVerified: true,
                    status: 'active',
                    avatar: 'https://ui.shadcn.com/avatars/01.png',
                };
            } else if (credentials.email === 'client@example.com') {
                return {
                    id: 'c1',
                    name: 'John Client',
                    email: 'client@example.com',
                    role: 'client',
                    isVerified: true,
                    status: 'active',
                    avatar: 'https://ui.shadcn.com/avatars/02.png',
                };
            } else if (credentials.email === 'admin@example.com') {
                return {
                    id: 'a1',
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin',
                    isVerified: true,
                    status: 'active',
                    avatar: 'https://ui.shadcn.com/avatars/03.png',
                };
            }
            return rejectWithValue('Invalid credentials');
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        // API call to invalidate session
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
    }
);

// Register async thunk
export const register = createAsyncThunk(
    'auth/register',
    async (userData: any, { rejectWithValue }) => {
        try {
            // API call would go here
            // const response = await api.post('/register', userData);
            // return response.data;

            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock user creation
            return {
                id: `u${Date.now()}`,
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                role: userData.role,
                isVerified: false,
                status: 'pending',
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload as User;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload as User;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default authSlice.reducer;
