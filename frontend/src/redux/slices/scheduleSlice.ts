import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export interface ScheduleItem {
    id: string;
    clientId: string;
    clientName: string;
    clientAvatar?: string;
    type: string;
    date: string; // ISO string
    duration: string;
    location: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    mode: 'onsite' | 'remote';
    notes?: string;
    serviceId?: string;
}

export interface ScheduleFilters {
    dateRange?: {
        start: string;
        end: string;
    };
    status?: ScheduleItem['status'][];
    clientId?: string;
    type?: string;
}

interface ScheduleState {
    items: ScheduleItem[];
    selectedDate: string | null;
    filters: ScheduleFilters;
    loading: boolean;
    error: string | null;
    stats: {
        totalShifts: number;
        upcomingShifts: number;
        completedShifts: number;
        cancelledShifts: number;
    };
}

const initialState: ScheduleState = {
    items: [],
    selectedDate: new Date().toISOString(),
    filters: {},
    loading: false,
    error: null,
    stats: {
        totalShifts: 0,
        upcomingShifts: 0,
        completedShifts: 0,
        cancelledShifts: 0,
    },
};

// Async thunks

/**
 * Fetch all schedule items for the worker
 */
export const fetchSchedule = createAsyncThunk(
    'schedule/fetchSchedule',
    async (filters?: ScheduleFilters) => {
        const response = await api.get('/api/worker/schedule', { params: filters });
        return response.data;
        
        // Mock fallback
        // await new Promise(resolve => setTimeout(resolve, 500));
        // const mockSchedule: ScheduleItem[] = [
        //     {
        //         id: '1',
        //         clientId: 'c1',
        //         clientName: 'Alice Freeman',
        //         type: 'Personal Care',
        //         date: new Date(2026, 0, 27, 9, 0).toISOString(),
        //         duration: '2 hours',
        //         location: '123 Main St, Sydney',
        //         status: 'confirmed',
        //         mode: 'onsite'
        //     },
        // ];
        // return mockSchedule;
    }
);

/**
 * Fetch schedule items for a specific date
 */
export const fetchScheduleByDate = createAsyncThunk(
    'schedule/fetchScheduleByDate',
    async (date: string) => {
        const response = await api.get(`/api/worker/schedule/date/${date}`);
        return response.data;
    }
);

/**
 * Fetch schedule for a date range
 */
export const fetchScheduleByDateRange = createAsyncThunk(
    'schedule/fetchScheduleByDateRange',
    async ({ start, end }: { start: string; end: string }) => {
        const response = await api.get('/api/worker/schedule/range', {
            params: { start, end }
        });
        return response.data;
    }
);

/**
 * Fetch a single schedule item by ID
 */
export const fetchScheduleItem = createAsyncThunk(
    'schedule/fetchScheduleItem',
    async (id: string) => {
        const response = await api.get(`/api/worker/schedule/${id}`);
        return response.data;
    }
);

/**
 * Create a new schedule item (book a shift)
 */
export const createScheduleItem = createAsyncThunk(
    'schedule/createScheduleItem',
    async (scheduleData: Omit<ScheduleItem, 'id' | 'status'>) => {
        const response = await api.post('/api/worker/schedule', scheduleData);
        return response.data;
    }
);

/**
 * Update an existing schedule item
 */
export const updateScheduleItem = createAsyncThunk(
    'schedule/updateScheduleItem',
    async (schedule: ScheduleItem) => {
        const response = await api.put(`/api/worker/schedule/${schedule.id}`, schedule);
        return response.data;
    }
);

/**
 * Reschedule a shift to a new date/time
 */
export const rescheduleShift = createAsyncThunk(
    'schedule/rescheduleShift',
    async ({ id, date }: { id: string; date: string }) => {
        const response = await api.patch(`/api/worker/schedule/${id}/reschedule`, { date });
        return response.data;
    }
);

/**
 * Cancel a scheduled shift
 */
export const cancelScheduleItem = createAsyncThunk(
    'schedule/cancelScheduleItem',
    async ({ id, reason }: { id: string; reason?: string }) => {
        const response = await api.patch(`/api/worker/schedule/${id}/cancel`, { reason });
        return response.data;
    }
);

/**
 * Mark a shift as completed
 */
export const completeScheduleItem = createAsyncThunk(
    'schedule/completeScheduleItem',
    async ({ id, notes }: { id: string; notes?: string }) => {
        const response = await api.patch(`/api/worker/schedule/${id}/complete`, { notes });
        return response.data;
    }
);

/**
 * Confirm a pending shift
 */
export const confirmScheduleItem = createAsyncThunk(
    'schedule/confirmScheduleItem',
    async (id: string) => {
        const response = await api.patch(`/api/worker/schedule/${id}/confirm`);
        return response.data;
    }
);

/**
 * Add notes to a schedule item
 */
export const addScheduleNotes = createAsyncThunk(
    'schedule/addScheduleNotes',
    async ({ id, notes }: { id: string; notes: string }) => {
        const response = await api.patch(`/api/worker/schedule/${id}/notes`, { notes });
        return response.data;
    }
);

/**
 * Get schedule statistics
 */
export const fetchScheduleStats = createAsyncThunk(
    'schedule/fetchScheduleStats',
    async () => {
        const response = await api.get('/api/worker/schedule/stats');
        return response.data;
    }
);

/**
 * Get upcoming shifts (next 7 days)
 */
export const fetchUpcomingShifts = createAsyncThunk(
    'schedule/fetchUpcomingShifts',
    async () => {
        const response = await api.get('/api/worker/schedule/upcoming');
        return response.data;
    }
);

/**
 * Get today's shifts
 */
export const fetchTodaySchedule = createAsyncThunk(
    'schedule/fetchTodaySchedule',
    async () => {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get(`/api/worker/schedule/date/${today}`);
        return response.data;
    }
);

/**
 * Request a change to a scheduled shift
 */
export const requestScheduleChange = createAsyncThunk(
    'schedule/requestScheduleChange',
    async ({ id, changes, reason }: { id: string; changes: Partial<ScheduleItem>; reason: string }) => {
        const response = await api.post(`/api/worker/schedule/${id}/request-change`, {
            changes,
            reason
        });
        return response.data;
    }
);

/**
 * Delete a schedule item
 */
export const deleteScheduleItem = createAsyncThunk(
    'schedule/deleteScheduleItem',
    async (id: string) => {
        await api.delete(`/api/worker/schedule/${id}`);
        return id;
    }
);

const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        setSelectedDate: (state, action: PayloadAction<string>) => {
            state.selectedDate = action.payload;
        },
        setFilters: (state, action: PayloadAction<ScheduleFilters>) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch schedule
            .addCase(fetchSchedule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch schedule';
            })

            // Fetch schedule by date
            .addCase(fetchScheduleByDate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchScheduleByDate.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchScheduleByDate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch schedule for date';
            })

            // Fetch schedule by date range
            .addCase(fetchScheduleByDateRange.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchScheduleByDateRange.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchScheduleByDateRange.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch schedule for date range';
            })

            // Fetch single schedule item
            .addCase(fetchScheduleItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchScheduleItem.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                } else {
                    state.items.push(action.payload);
                }
            })
            .addCase(fetchScheduleItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch schedule item';
            })

            // Create schedule item
            .addCase(createScheduleItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createScheduleItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createScheduleItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create schedule item';
            })

            // Update schedule item
            .addCase(updateScheduleItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateScheduleItem.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateScheduleItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update schedule item';
            })

            // Reschedule shift
            .addCase(rescheduleShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rescheduleShift.fulfilled, (state, action) => {
                state.loading = false;
                const item = state.items.find(item => item.id === action.payload.id);
                if (item) {
                    item.date = action.payload.date;
                }
            })
            .addCase(rescheduleShift.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to reschedule shift';
            })

            // Cancel schedule item
            .addCase(cancelScheduleItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelScheduleItem.fulfilled, (state, action) => {
                state.loading = false;
                const item = state.items.find(item => item.id === action.payload.id);
                if (item) {
                    item.status = 'cancelled';
                }
            })
            .addCase(cancelScheduleItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to cancel schedule item';
            })

            // Complete schedule item
            .addCase(completeScheduleItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeScheduleItem.fulfilled, (state, action) => {
                state.loading = false;
                const item = state.items.find(item => item.id === action.payload.id);
                if (item) {
                    item.status = 'completed';
                    if (action.payload.notes) {
                        item.notes = action.payload.notes;
                    }
                }
            })
            .addCase(completeScheduleItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to complete schedule item';
            })

            // Confirm schedule item
            .addCase(confirmScheduleItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(confirmScheduleItem.fulfilled, (state, action) => {
                state.loading = false;
                const item = state.items.find(item => item.id === action.payload.id);
                if (item) {
                    item.status = 'confirmed';
                }
            })
            .addCase(confirmScheduleItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to confirm schedule item';
            })

            // Add schedule notes
            .addCase(addScheduleNotes.fulfilled, (state, action) => {
                const item = state.items.find(item => item.id === action.payload.id);
                if (item) {
                    item.notes = action.payload.notes;
                }
            })

            // Fetch schedule stats
            .addCase(fetchScheduleStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })

            // Fetch upcoming shifts
            .addCase(fetchUpcomingShifts.fulfilled, (state, action) => {
                state.items = action.payload;
            })

            // Fetch today's schedule
            .addCase(fetchTodaySchedule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTodaySchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTodaySchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch today\'s schedule';
            })

            // Request schedule change
            .addCase(requestScheduleChange.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestScheduleChange.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally update the item with a pending change indicator
            })
            .addCase(requestScheduleChange.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to request schedule change';
            })

            // Delete schedule item
            .addCase(deleteScheduleItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteScheduleItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(deleteScheduleItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete schedule item';
            });
    },
});

export const { setSelectedDate, setFilters, clearFilters, clearError } = scheduleSlice.actions;

export default scheduleSlice.reducer;
