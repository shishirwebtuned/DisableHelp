import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { WorkerProfile, ClientProfile } from '@/types';
import api from '@/lib/axios';
import { WorkerProfileSchema } from '@/types/workerProfileSchema';

interface ProfileState {
    workerProfile: WorkerProfile | null;
    clientProfile: ClientProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    workerProfile: null,
    clientProfile: null,
    loading: false,
    error: null,
};

// Mock async thunk for fetching worker profile
export const fetchWorkerProfile = createAsyncThunk(
    'profile/fetchWorkerProfile',
    async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        const mockProfile: WorkerProfile = {
            id: 'wp1',
            userId,
            personalInfo: {
                firstName: 'Sarah',
                lastName: 'Worker',
                phone: '+61 400 000 000',
                dateOfBirth: '1990-01-15',
                gender: 'Female',
            },
            location: {
                address: '123 Main St',
                suburb: 'Sydney',
                state: 'NSW',
                postcode: '2000',
            },
            availability: {
                monday: [{ start: '09:00', end: '17:00' }],
                tuesday: [],
                wednesday: [{ start: '09:00', end: '17:00' }],
                thursday: [],
                friday: [{ start: '09:00', end: '17:00' }],
                saturday: [],
                sunday: [],
            },
            hourlyRate: 45,
            photoUrl: '',
            bankDetails: undefined,
            workHistory: [
                {
                    id: 'wh1',
                    title: 'Support Worker',
                    organization: 'Care Services Ltd',
                    startDate: '2020-01-01',
                    endDate: '2023-12-31',
                    description: 'Provided personal care and support',
                },
            ],
            credentials: [
                {
                    id: 'c1',
                    type: 'NDIS',
                    number: 'NDIS123456',
                    issueDate: '2023-01-01',
                    expiryDate: '2025-01-01',
                    status: 'valid',
                },
                {
                    id: 'c2',
                    type: 'WWCC',
                    number: 'WWCC789012',
                    issueDate: '2022-06-01',
                    expiryDate: '2027-06-01',
                    status: 'valid',
                },
            ],
            languages: ['English', 'Mandarin'],
            preferences: ['Elderly Care', 'Disability Support'],
            completeness: 45,
        };

        return mockProfile;
    }
);

// Mock async thunk for updating worker profile
// Update worker profile
export const updateWorkerProfile = createAsyncThunk(
    'profile/updateWorkerProfile',
    async (profileData: Partial<WorkerProfile> | FormData, { rejectWithValue }) => {
        try {
            // If profileData is FormData, axios will automatically set the Content-Type to multipart/form-data
            const response = await api.patch('/profile/worker', profileData);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: 'Failed to update profile' });
        }
    }
);

// Submit worker profile to API
export const submitWorkerProfile = createAsyncThunk(
    'profile/submitWorkerProfile',
    async (profileData: WorkerProfileSchema, { rejectWithValue }) => {
        try {
            const response = await api.put('/profile/worker', profileData);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: 'Failed to submit profile' });
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setWorkerProfile(state, action: PayloadAction<WorkerProfile>) {
            state.workerProfile = action.payload;
        },
        setClientProfile(state, action: PayloadAction<ClientProfile>) {
            state.clientProfile = action.payload;
        },
        updateProfileCompleteness(state, action: PayloadAction<number>) {
            if (state.workerProfile) {
                state.workerProfile.completeness = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkerProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkerProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.workerProfile = action.payload;
            })
            .addCase(fetchWorkerProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch profile';
            })
            .addCase(updateWorkerProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateWorkerProfile.fulfilled, (state, action) => {
                state.loading = false;
                if (state.workerProfile) {
                    state.workerProfile = { ...state.workerProfile, ...action.payload };
                }
            })
            .addCase(submitWorkerProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitWorkerProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Optionally update the worker profile with response data
                if (action.payload && action.payload.data) {
                    state.workerProfile = action.payload.data;
                }
            })
            .addCase(submitWorkerProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to submit profile';
            });
    },
});

export const { setWorkerProfile, setClientProfile, updateProfileCompleteness } = profileSlice.actions;
export default profileSlice.reducer;
