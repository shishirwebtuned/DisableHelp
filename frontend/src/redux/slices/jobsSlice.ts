import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Job, Application } from '@/types';

interface JobsState {
    jobs: Job[];
    applications: Application[];
    selectedJob: Job | null;
    loading: boolean;
    error: string | null;
    viewMode: 'card' | 'table';
}

const initialState: JobsState = {
    jobs: [],
    applications: [],
    selectedJob: null,
    loading: false,
    error: null,
    viewMode: 'card',
};

// Mock async thunk for fetching jobs
export const fetchJobs = createAsyncThunk(
    'jobs/fetchJobs',
    async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockJobs: Job[] = [
            {
                id: 'j1',
                title: 'Personal Care Support - Morning Shift',
                clientId: 'c1',
                clientName: 'Alice Freeman',
                description: 'Looking for a reliable support worker to assist with morning routines, personal care, and light household tasks.',
                location: 'Sydney, NSW 2000',
                rate: 45,
                tags: ['Personal Care', 'Morning', 'Elderly Care'],
                status: 'published',
                requirements: ['NDIS Worker Screening', 'First Aid Certificate', 'Experience with elderly care'],
                startDate: '2026-02-01',
                hoursPerWeek: 15,
                createdAt: '2026-01-20T10:00:00Z',
                updatedAt: '2026-01-20T10:00:00Z',
            },
            {
                id: 'j2',
                title: 'Disability Support Worker - Weekends',
                clientId: 'c2',
                clientName: 'Bob Smith',
                description: 'Weekend support needed for community access and social activities. Must be patient and energetic.',
                location: 'Melbourne, VIC 3000',
                rate: 50,
                tags: ['Disability Support', 'Weekend', 'Community Access'],
                status: 'published',
                requirements: ['NDIS Registration', 'WWCC', 'Driver License'],
                startDate: '2026-02-15',
                hoursPerWeek: 10,
                createdAt: '2026-01-22T14:00:00Z',
                updatedAt: '2026-01-22T14:00:00Z',
            },
            {
                id: 'j3',
                title: 'Respite Care Support',
                clientId: 'c3',
                clientName: 'Carol Johnson',
                description: 'Flexible respite care needed for family caregiver breaks. Experience with dementia care preferred.',
                location: 'Brisbane, QLD 4000',
                rate: 48,
                tags: ['Respite Care', 'Flexible', 'Dementia Care'],
                status: 'published',
                requirements: ['Dementia training', 'NDIS Screening', 'References'],
                startDate: '2026-02-10',
                hoursPerWeek: 12,
                createdAt: '2026-01-25T09:00:00Z',
                updatedAt: '2026-01-25T09:00:00Z',
            },
        ];

        return mockJobs;
    }
);

// Mock async thunk for applying to a job
export const applyToJob = createAsyncThunk(
    'jobs/applyToJob',
    async ({ jobId, workerId, coverLetter }: { jobId: string; workerId: string; coverLetter: string }) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const application: Application = {
            id: `app-${Date.now()}`,
            jobId,
            workerId,
            workerName: 'Sarah Worker',
            status: 'pending',
            coverLetter,
            appliedAt: new Date().toISOString(),
        };

        return application;
    }
);

// Async thunk for creating a job (client)
export const createJob = createAsyncThunk(
    'jobs/createJob',
    async (jobData: Partial<Job>) => {
        // TODO: Replace with actual API call
        // const response = await axios.post('/api/jobs', jobData);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const newJob: Job = {
            id: `j-${Date.now()}`,
            title: jobData.title || '',
            clientId: jobData.clientId || 'c1',
            clientName: jobData.clientName || 'Current Client',
            description: jobData.description || '',
            location: jobData.location || '',
            rate: jobData.rate || 0,
            tags: jobData.tags || [],
            status: jobData.status || 'draft',
            requirements: jobData.requirements || [],
            startDate: jobData.startDate || '',
            hoursPerWeek: jobData.hoursPerWeek || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        console.log('API Call: POST /api/jobs', newJob);
        return newJob;
    }
);

// Async thunk for updating a job (client)
export const updateJobThunk = createAsyncThunk(
    'jobs/updateJobThunk',
    async ({ id, jobData }: { id: string; jobData: Partial<Job> }) => {
        // TODO: Replace with actual API call
        // const response = await axios.put(`/api/jobs/${id}`, jobData);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const updatedJob = {
            ...jobData,
            id,
            updatedAt: new Date().toISOString(),
        };

        console.log('API Call: PUT /api/jobs/' + id, updatedJob);
        return updatedJob as Job;
    }
);

// Async thunk for deleting a job (client)
export const deleteJobThunk = createAsyncThunk(
    'jobs/deleteJobThunk',
    async (jobId: string) => {
        // TODO: Replace with actual API call
        // await axios.delete(`/api/jobs/${jobId}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: DELETE /api/jobs/' + jobId);
        return jobId;
    }
);

const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        setJobs(state, action: PayloadAction<Job[]>) {
            state.jobs = action.payload;
        },
        setSelectedJob(state, action: PayloadAction<Job | null>) {
            state.selectedJob = action.payload;
        },
        setViewMode(state, action: PayloadAction<'card' | 'table'>) {
            state.viewMode = action.payload;
        },
        addJob(state, action: PayloadAction<Job>) {
            state.jobs.push(action.payload);
        },
        updateJob(state, action: PayloadAction<Job>) {
            const index = state.jobs.findIndex(job => job.id === action.payload.id);
            if (index !== -1) {
                state.jobs[index] = action.payload;
            }
        },
        deleteJob(state, action: PayloadAction<string>) {
            state.jobs = state.jobs.filter(job => job.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch jobs';
            })
            .addCase(applyToJob.pending, (state) => {
                state.loading = true;
            })
            .addCase(applyToJob.fulfilled, (state, action) => {
                state.loading = false;
                state.applications.push(action.payload);
            })
            .addCase(applyToJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to apply to job';
            })
            // Create job
            .addCase(createJob.pending, (state) => {
                state.loading = true;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs.push(action.payload);
            })
            .addCase(createJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create job';
            })
            // Update job
            .addCase(updateJobThunk.fulfilled, (state, action) => {
                const index = state.jobs.findIndex(job => job.id === action.payload.id);
                if (index !== -1) {
                    state.jobs[index] = { ...state.jobs[index], ...action.payload };
                }
            })
            // Delete job
            .addCase(deleteJobThunk.fulfilled, (state, action) => {
                state.jobs = state.jobs.filter(job => job.id !== action.payload);
            });
    },
});

export const { setJobs, setSelectedJob, setViewMode, addJob, updateJob, deleteJob } = jobsSlice.actions;
export default jobsSlice.reducer;
