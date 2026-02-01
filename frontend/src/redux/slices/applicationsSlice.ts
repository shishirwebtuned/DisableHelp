import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    workerId: string;
    workerName: string;
    workerEmail: string;
    workerPhone: string;
    workerExperience: string;
    coverLetter: string;
    appliedAt: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    skills: string[];
    availability: string;
}

interface ApplicationsState {
    items: Application[];
    loading: boolean;
    error: string | null;
}

const initialState: ApplicationsState = {
    items: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchApplications = createAsyncThunk(
    'applications/fetchApplications',
    async (jobId?: string) => {
        // TODO: Replace with actual API call
        // const response = await axios.get(`/api/applications${jobId ? `?jobId=${jobId}` : ''}`);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const mockApplications: Application[] = [
            {
                id: 'app-1',
                jobId: 'j1',
                jobTitle: 'Personal Care Support - Morning Shift',
                workerId: 'w1',
                workerName: 'Sarah Thompson',
                workerEmail: 'sarah.t@email.com',
                workerPhone: '0412 345 678',
                workerExperience: '5 years',
                coverLetter: 'I am very interested in this position and have extensive experience in personal care...',
                appliedAt: new Date(2026, 0, 21).toISOString(),
                status: 'pending',
                skills: ['Personal Care', 'Mobility Assistance', 'Medication Management'],
                availability: 'Monday-Friday, 7am-3pm'
            },
            {
                id: 'app-2',
                jobId: 'j1',
                jobTitle: 'Personal Care Support - Morning Shift',
                workerId: 'w2',
                workerName: 'Michael Chen',
                workerEmail: 'michael.c@email.com',
                workerPhone: '0423 456 789',
                workerExperience: '3 years',
                coverLetter: 'With my background in aged care and disability support, I believe I would be a great fit...',
                appliedAt: new Date(2026, 0, 22).toISOString(),
                status: 'pending',
                skills: ['Personal Care', 'First Aid', 'Dementia Care'],
                availability: 'Flexible schedule'
            },
            {
                id: 'app-3',
                jobId: 'j1',
                jobTitle: 'Personal Care Support - Morning Shift',
                workerId: 'w3',
                workerName: 'Emma Rodriguez',
                workerEmail: 'emma.r@email.com',
                workerPhone: '0434 567 890',
                workerExperience: '7 years',
                coverLetter: 'I have been working in disability support for over 7 years and am passionate about making a difference...',
                appliedAt: new Date(2026, 0, 23).toISOString(),
                status: 'accepted',
                skills: ['Personal Care', 'Behavioral Support', 'Communication'],
                availability: 'Monday-Friday, mornings'
            },
            {
                id: 'app-4',
                jobId: 'j1',
                jobTitle: 'Personal Care Support - Morning Shift',
                workerId: 'w4',
                workerName: 'James Wilson',
                workerEmail: 'james.w@email.com',
                workerPhone: '0445 678 901',
                workerExperience: '2 years',
                coverLetter: 'Though I am relatively new to the field, I am eager to learn and committed to providing excellent care...',
                appliedAt: new Date(2026, 0, 24).toISOString(),
                status: 'pending',
                skills: ['Basic Care', 'Companionship'],
                availability: 'Weekdays, flexible hours'
            },
            {
                id: 'app-5',
                jobId: 'j1',
                jobTitle: 'Personal Care Support - Morning Shift',
                workerId: 'w5',
                workerName: 'Lisa Anderson',
                workerEmail: 'lisa.a@email.com',
                workerPhone: '0456 789 012',
                workerExperience: '4 years',
                coverLetter: 'My experience includes working with clients with various needs and I pride myself on my compassionate approach...',
                appliedAt: new Date(2026, 0, 25).toISOString(),
                status: 'rejected',
                skills: ['Personal Care', 'Meal Preparation', 'Domestic Support'],
                availability: 'Part-time, mornings preferred'
            }
        ];

        console.log('API Call: GET /api/applications', { jobId });
        return jobId ? mockApplications.filter(app => app.jobId === jobId) : mockApplications;
    }
);

export const acceptApplication = createAsyncThunk(
    'applications/acceptApplication',
    async (applicationId: string) => {
        // TODO: Replace with actual API call
        // const response = await axios.patch(`/api/applications/${applicationId}/accept`);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: PATCH /api/applications/' + applicationId + '/accept');
        return applicationId;
    }
);

export const rejectApplication = createAsyncThunk(
    'applications/rejectApplication',
    async (applicationId: string) => {
        // TODO: Replace with actual API call
        // const response = await axios.patch(`/api/applications/${applicationId}/reject`);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: PATCH /api/applications/' + applicationId + '/reject');
        return applicationId;
    }
);

const applicationsSlice = createSlice({
    name: 'applications',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch applications
            .addCase(fetchApplications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch applications';
            })
            // Accept application
            .addCase(acceptApplication.fulfilled, (state, action) => {
                const application = state.items.find(app => app.id === action.payload);
                if (application) {
                    application.status = 'accepted';
                }
            })
            // Reject application
            .addCase(rejectApplication.fulfilled, (state, action) => {
                const application = state.items.find(app => app.id === action.payload);
                if (application) {
                    application.status = 'rejected';
                }
            });
    },
});

export default applicationsSlice.reducer;
