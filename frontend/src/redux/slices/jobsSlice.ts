import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Job, Application } from "@/types";
import api from "@/lib/axios";

interface JobsState {
  _id: string | null;
  jobs: Job[];
  applications: Application[];
  selectedJob: Job | null;
  loading: boolean;
  applying: boolean;
  error: string | null;
  viewMode: "card" | "table";
  myApplication: Application | null;
  total: number;
  totalPages: number;
  limit: number;
}

const initialState: JobsState = {
  _id: null,
  jobs: [],
  applications: [],
  selectedJob: null,
  loading: false,
  applying: false,
  error: null,
  viewMode: "card",
  myApplication: null,
  total: 0,
  totalPages: 1,
  limit: 10,
};

// Fetch client's own jobs
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params?: any) => {
    const { append, ...rest } = params ?? {};
    const response = await api.get("job", { params: rest });
    const data = response.data.data;
    return {
      jobs: data?.jobsData ?? [],
      total: data?.pagination?.total ?? data?.total ?? 0,
      totalPages: data?.pagination?.totalPages ?? 1,
      append: !!append,
    };
  },
);

// Fetch a single job by id (for edit pre-fill)
export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (id: string) => {
    const response = await api.get(`job/${id}`);
    return response.data.data ?? response.data.data;
  },
);

// Apply to a job (real API)
export const applyToJobThunk = createAsyncThunk(
  "jobs/applyToJob",
  async (
    payload: {
      job: string;
      introduction: string;
      skills: string;
      availability: any[];
      hourlyRate: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("application", payload);
      return response.data.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to apply to job",
      );
    }
  },
);

// Create a new job
export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("job", jobData);
      return response.data.data?.job ?? response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create job",
      );
    }
  },
);

// Update an existing job
export const updateJobThunk = createAsyncThunk(
  "jobs/updateJobThunk",
  async (
    { id, jobData }: { id: string; jobData: any },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(`job/${id}`, jobData);
      return response.data.data?.job ?? response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update job",
      );
    }
  },
);

// Delete a job
export const deleteJobThunk = createAsyncThunk(
  "jobs/deleteJobThunk",
  async (jobId: string, { rejectWithValue }) => {
    try {
      await api.delete(`job/${jobId}`);
      return jobId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete job",
      );
    }
  },
);

export const getmyapplication = createAsyncThunk(
  "jobs/getmyapplication",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`application/applicant/${jobId}`);
      return response.data.data.applications ?? response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to get my application",
      );
    }
  },
);

export const getJobByClient = createAsyncThunk(
  "jobs/getJobByClient",
  async (params?: any) => {
    const { append, ...rest } = params ?? {};
    const response = await api.get("job/client", { params: rest });
    const data = response.data.data;
    return {
      jobs: data?.jobsData ?? [],
      total: data?.pagination?.total ?? data?.total ?? 0,
      totalPages: data?.pagination?.totalPages ?? 1,
      append: !!append,
    };
  },
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<Job[]>) {
      state.jobs = action.payload;
    },
    setSelectedJob(state, action: PayloadAction<Job | null>) {
      state.selectedJob = action.payload;
    },
    setTotal(state, action: PayloadAction<number>) {
      state.total = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    setMyApplication(state, action: PayloadAction<Application | null>) {
      state.myApplication = action.payload;
    },
    setViewMode(state, action: PayloadAction<"card" | "table">) {
      state.viewMode = action.payload;
    },
    addJob(state, action: PayloadAction<Job>) {
      state.jobs.push(action.payload);
    },
    updateJob(state, action: PayloadAction<Job>) {
      const index = state.jobs.findIndex(
        (job) => job._id === action.payload._id,
      );
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
    },
    deleteJob(state, action: PayloadAction<string>) {
      state.jobs = state.jobs.filter((job) => job._id !== action.payload);
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
        if (action.payload.append) {
          // Append deduplicated jobs for infinite scroll
          const existingIds = new Set(state.jobs.map((j) => j._id));
          const newJobs = action.payload.jobs.filter(
            (j: Job) => !existingIds.has(j._id),
          );
          state.jobs = [...state.jobs, ...newJobs];
        } else {
          state.jobs = action.payload.jobs;
        }
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.selectedJob = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch job";
      })
      .addCase(applyToJobThunk.pending, (state) => {
        state.applying = true;
        state.error = null;
      })
      .addCase(applyToJobThunk.fulfilled, (state, action) => {
        state.applying = false;
      })
      .addCase(applyToJobThunk.rejected, (state, action) => {
        state.applying = false;
        state.error = (action.payload as string) || "Failed to apply to job";
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
        state.error = action.error.message || "Failed to create job";
      })
      // Update job
      .addCase(updateJobThunk.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(
          (job) => job._id === action.payload._id,
        );
        if (index !== -1) {
          state.jobs[index] = { ...state.jobs[index], ...action.payload };
        }
      })
      // Delete job
      .addCase(deleteJobThunk.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((job) => job._id !== action.payload);
      })
      .addCase(getmyapplication.fulfilled, (state, action) => {
        state.myApplication = action.payload;
      })
      .addCase(getmyapplication.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to get my application";
      })
      .addCase(getJobByClient.fulfilled, (state, action) => {
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getJobByClient.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to get jobs by client";
      });
  },
});

export const {
  setJobs,
  setSelectedJob,
  setViewMode,
  addJob,
  updateJob,
  deleteJob,
} = jobsSlice.actions;
export default jobsSlice.reducer;
