import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';
export interface Timesheet {
    id: number;
    date: string;
    client: string;
    startTime: string;
    endTime: string;
    hours: number;
    breakMinutes: number;
    serviceType: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    notes: string;
    rate: number;
}

interface TimesheetsState {
    items: Timesheet[];
    loading: boolean;
    error: string | null;
}

const initialState: TimesheetsState = {
    items: [],
    loading: false,
    error: null,
};

// Async thunk for fetching timesheets
export const fetchTimesheets = createAsyncThunk(
    'timesheets/fetchTimesheets',
    async () => {
        // TODO: Replace with actual API call
        // const response = await axios.get('/api/timesheets');
        // return response.data;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTimesheets: Timesheet[] = [
            {
                id: 1,
                date: '2026-01-27',
                client: 'John Client',
                startTime: '09:00',
                endTime: '13:00',
                hours: 4.0,
                breakMinutes: 0,
                serviceType: 'Personal Care',
                status: 'submitted',
                notes: 'Morning routine assistance',
                rate: 45,
            },
            {
                id: 2,
                date: '2026-01-27',
                client: 'Emily Anderson',
                startTime: '14:00',
                endTime: '18:30',
                hours: 4.5,
                breakMinutes: 30,
                serviceType: 'Community Access',
                status: 'approved',
                notes: 'Shopping and medical appointment',
                rate: 48,
            },
            {
                id: 3,
                date: '2026-01-26',
                client: 'John Client',
                startTime: '09:00',
                endTime: '13:00',
                hours: 4.0,
                breakMinutes: 0,
                serviceType: 'Personal Care',
                status: 'approved',
                notes: 'Morning routine',
                rate: 45,
            },
            {
                id: 4,
                date: '2026-01-25',
                client: 'Sarah Mitchell',
                startTime: '10:00',
                endTime: '16:00',
                hours: 6.0,
                breakMinutes: 30,
                serviceType: 'Disability Support',
                status: 'draft',
                notes: 'Full day support',
                rate: 50,
            },
        ];

        return mockTimesheets;
    }
);

// Async thunk for creating a timesheet
export const createTimesheet = createAsyncThunk(
    'timesheets/createTimesheet',
    async (timesheet: Omit<Timesheet, 'id'>) => {
        // TODO: Replace with actual API call
        // const response = await axios.post('/api/timesheets', timesheet);
        // return response.data;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newTimesheet: Timesheet = {
            ...timesheet,
            id: Date.now(), // Generate temporary ID
        };
        
        console.log('API Call: POST /api/timesheets', newTimesheet);
        return newTimesheet;
    }
);

// Async thunk for updating a timesheet
export const updateTimesheet = createAsyncThunk(
    'timesheets/updateTimesheet',
    async (timesheet: Timesheet) => {
        // TODO: Replace with actual API call
        // const response = await axios.put(`/api/timesheets/${timesheet.id}`, timesheet);
        // return response.data;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('API Call: PUT /api/timesheets/' + timesheet.id, timesheet);
        return timesheet;
    }
);

// Async thunk for deleting a timesheet
export const deleteTimesheet = createAsyncThunk(
    'timesheets/deleteTimesheet',
    async (id: number) => {
        // TODO: Replace with actual API call
        // await axios.delete(`/api/timesheets/${id}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('API Call: DELETE /api/timesheets/' + id);
        return id;
    }
);

// Async thunk for updating timesheet status
export const updateTimesheetStatus = createAsyncThunk(
    'timesheets/updateTimesheetStatus',
    async ({ id, status }: { id: number; status: Timesheet['status'] }) => {
        // TODO: Replace with actual API call
        const response = await api.patch(`/api/timesheets/${id}`, { status });
        return response.data;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('API Call: PATCH /api/timesheets/' + id, { status });
        return { id, status };
    }
);

const timesheetsSlice = createSlice({
    name: 'timesheets',
    initialState,
    reducers: {
        // Optional: Add synchronous actions if needed
    },
    extraReducers: (builder) => {
        builder
            // Fetch timesheets
            .addCase(fetchTimesheets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTimesheets.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTimesheets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch timesheets';
            })
            // Create timesheet
            .addCase(createTimesheet.pending, (state) => {
                state.loading = true;
            })
            .addCase(createTimesheet.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(createTimesheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create timesheet';
            })
            // Update timesheet
            .addCase(updateTimesheet.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTimesheet.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateTimesheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update timesheet';
            })
            // Delete timesheet
            .addCase(deleteTimesheet.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteTimesheet.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(t => t.id !== action.payload);
            })
            .addCase(deleteTimesheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete timesheet';
            })
            // Update status
            .addCase(updateTimesheetStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTimesheetStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index].status = action.payload.status;
                }
            })
            .addCase(updateTimesheetStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update status';
            });
    },
});

export default timesheetsSlice.reducer;
