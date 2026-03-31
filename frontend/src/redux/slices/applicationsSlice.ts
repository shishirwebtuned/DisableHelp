import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface ApplicationApplicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: {
    line1?: string;
    line2?: string;
    state?: string;
    postalCode?: string;
  };
  isNdisProvider?: boolean;
  approved?: boolean;
}

export interface ApplicationSession {
  day: string;
  period: { startTime: string; endTime: string }[];
}

export interface Application {
  _id: string;
  job: { _id: string; title: string };
  applicant: ApplicationApplicant;
  status: "pending" | "accepted" | "rejected";
  introduction: string;
  skills: string;
  availability: ApplicationSession[];
  createdAt: string;
  hourlyRate: number;
}

interface ApplicationsState {
  items: Application[];
  myItems: Application[];
  myLoading: boolean;
  loading: boolean;
  error: string | null;
  total: number;
  limit: number;
  myTotal: number;
  myLimit: number;
  myTotalPages: number;
  myTotalPending: number;
  myTotalAccepted: number;
  myTotalRejected: number;
}

const initialState: ApplicationsState = {
  items: [],
  myItems: [],
  myLoading: false,
  loading: false,
  error: null,
  total: 0,
  limit: 0,
  myTotal: 0,
  myLimit: 0,
  myTotalPages: 1,
  myTotalPending: 0,
  myTotalAccepted: 0,
  myTotalRejected: 0,
};

// Fetch the logged-in worker's own applications
export const fetchMyApplications = createAsyncThunk(
  "applications/fetchMyApplications",
  async (
    params?: { page?: number; limit?: number; userID?: string },
    { rejectWithValue }: any = {},
  ) => {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const response = await api.get(
        `application/applicant/${params?.userID}?page=${page}&limit=${limit}`,
      );
      const d = response.data.data;
      const items: Application[] = Array.isArray(d)
        ? d
        : (d?.applications ?? d ?? []);
      const pg = d?.pagination ?? {};
      return {
        items,
        total: pg.total ?? 0,
        limit: pg.limit ?? limit,
        totalPages: pg.totalPages ?? 1,
        totalPending: pg.totalPending ?? 0,
        totalAccepted: pg.totalAccepted ?? 0,
        totalRejected: pg.totalRejected ?? 0,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch your applications",
      );
    }
  },
);

// Fetch all applications for a specific job
export const fetchApplications = createAsyncThunk(
  "applications/fetchApplications",
  async (jobId?: string, { rejectWithValue }: any = {}) => {
    try {
      const url = jobId ? `application/job/${jobId}` : "application";
      const response = await api.get(url);
      const d = response.data.data;
      // API returns { applications: [...], pagination: { total, limit, ... } }
      const items: Application[] = Array.isArray(d)
        ? d
        : (d?.applications ?? d ?? []);
      const total: number = d?.pagination?.total ?? d?.total ?? 0;
      const limit: number = d?.pagination?.limit ?? d?.limit ?? 0;
      return { items, total, limit };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch applications",
      );
    }
  },
);

export const acceptApplication = createAsyncThunk(
  "applications/acceptApplication",
  async (applicationId: string, { rejectWithValue }: any = {}) => {
    try {
      await api.patch(`application/${applicationId}/accept`, {
        status: "accepted",
      });
      return applicationId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to accept application",
      );
    }
  },
);

export const rejectApplication = createAsyncThunk(
  "applications/rejectApplication",
  async (applicationId: string, { rejectWithValue }: any = {}) => {
    try {
      await api.patch(`application/${applicationId}/reject`, {
        status: "rejected",
      });
      return applicationId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to reject application",
      );
    }
  },
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.limit = action.payload.limit;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch applications";
      })
      .addCase(acceptApplication.fulfilled, (state, action) => {
        const app = state.items.find((a) => a._id === action.payload);
        if (app) app.status = "accepted";
      })
      .addCase(fetchMyApplications.pending, (state) => {
        state.myLoading = true;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.myLoading = false;
        state.myItems = action.payload.items;
        state.myTotal = action.payload.total;
        state.myLimit = action.payload.limit;
        state.myTotalPages = action.payload.totalPages;
        state.myTotalPending = action.payload.totalPending;
        state.myTotalAccepted = action.payload.totalAccepted;
        state.myTotalRejected = action.payload.totalRejected;
      })
      .addCase(fetchMyApplications.rejected, (state) => {
        state.myLoading = false;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
        const app = state.items.find((a) => a._id === action.payload);
        if (app) app.status = "rejected";
      });
  },
});

export default applicationsSlice.reducer;
