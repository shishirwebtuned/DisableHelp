import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Session {
    id: string;
    workerId: string;
    workerName: string;
    type: string;
    date: string; // ISO string
    duration: string;
    location: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    mode: 'onsite' | 'remote';
}

interface SessionsState {
    items: Session[];
    loading: boolean;
    error: string | null;
}

const initialState: SessionsState = {
    items: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchSessions = createAsyncThunk(
    'sessions/fetchSessions',
    async () => {
        // TODO: Replace with actual API call
        // const response = await axios.get('/api/sessions');
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const mockSessions: Session[] = [
            {
                id: '1',
                workerId: 'w1',
                workerName: 'Sarah Worker',
                type: 'Personal Care',
                date: new Date(2026, 0, 27, 9, 0).toISOString(),
                duration: '2 hours',
                location: 'Home - 123 Main St, Sydney',
                status: 'confirmed',
                mode: 'onsite'
            },
            {
                id: '1-1',
                workerId: 'w1',
                workerName: 'Sarah Worker',
                type: 'Personal Care',
                date: new Date(2026, 0, 28, 9, 0).toISOString(),
                duration: '2 hours',
                location: 'Home - 123 Main St, Sydney',
                status: 'confirmed',
                mode: 'onsite'
            },
            {
                id: '2',
                workerId: 'w2',
                workerName: 'John Smith',
                type: 'Community Support',
                date: new Date(2026, 0, 30, 14, 0).toISOString(),
                duration: '3 hours',
                location: 'Neutral Bay Community Centre',
                status: 'pending',
                mode: 'onsite'
            },
            {
                id: '3',
                workerId: 'w3',
                workerName: 'Emma Wilson',
                type: 'Check-in Call',
                date: new Date(2026, 0, 27, 11, 30).toISOString(),
                duration: '30 mins',
                location: 'Online / Video Call',
                status: 'confirmed',
                mode: 'remote'
            },
            {
                id: '4',
                workerId: 'w4',
                workerName: 'Michael Brown',
                type: 'Therapy Session',
                date: new Date(2026, 1, 5, 10, 0).toISOString(),
                duration: '1 hour',
                location: 'Sydney CBD Clinic',
                status: 'confirmed',
                mode: 'onsite'
            }
        ];

        console.log('API Call: GET /api/sessions');
        return mockSessions;
    }
);

export const createSession = createAsyncThunk(
    'sessions/createSession',
    async (sessionData: Omit<Session, 'id' | 'status'>) => {
        // TODO: Replace with actual API call
        // const response = await axios.post('/api/sessions', sessionData);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const newSession: Session = {
            ...sessionData,
            id: `session-${Date.now()}`,
            status: 'pending',
        };

        console.log('API Call: POST /api/sessions', sessionData);
        return newSession;
    }
);

export const updateSession = createAsyncThunk(
    'sessions/updateSession',
    async (session: Session) => {
        // TODO: Replace with actual API call
        // const response = await axios.put(`/api/sessions/${session.id}`, session);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: PUT /api/sessions/' + session.id, session);
        return session;
    }
);

export const rescheduleSession = createAsyncThunk(
    'sessions/rescheduleSession',
    async ({ id, date }: { id: string; date: string }) => {
        // TODO: Replace with actual API call
        // const response = await axios.patch(`/api/sessions/${id}/reschedule`, { date });
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: PATCH /api/sessions/' + id + '/reschedule', { date });
        return { id, date };
    }
);

export const cancelSession = createAsyncThunk(
    'sessions/cancelSession',
    async (id: string) => {
        // TODO: Replace with actual API call
        // const response = await axios.patch(`/api/sessions/${id}/cancel`);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: PATCH /api/sessions/' + id + '/cancel');
        return id;
    }
);

const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch sessions
            .addCase(fetchSessions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch sessions';
            })
            // Create session
            .addCase(createSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(createSession.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create session';
            })
            // Update session
            .addCase(updateSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSession.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update session';
            })
            // Reschedule session
            .addCase(rescheduleSession.fulfilled, (state, action) => {
                const session = state.items.find(s => s.id === action.payload.id);
                if (session) {
                    session.date = action.payload.date;
                }
            })
            // Cancel session
            .addCase(cancelSession.fulfilled, (state, action) => {
                const session = state.items.find(s => s.id === action.payload);
                if (session) {
                    session.status = 'cancelled';
                }
            });
    },
});

export default sessionsSlice.reducer;
