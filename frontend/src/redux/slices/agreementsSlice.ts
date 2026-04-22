import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface SchedulePeriod {
  startTime?: string;
  endTime?: string;
}

interface ScheduleDay {
  day?: string;
  period?: SchedulePeriod[];
}

interface SupportDetail {
  name?: string;
  description?: string;
}
export interface Agreement {
  _id: string;
  job: {
    _id: string;
    title: string;
    location?: {
      line1?: string;
      suburb?: string;
      state?: string;
      postalCode?: string;
    };
    supportDetails?: SupportDetail[];
  } | null;
  client: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: {
      line1?: string;
      suburb?: string;
      state?: string;
      postalCode?: string;
    };
  };
  worker:
    | {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
      }
    | string;
  application: string;
  status: "pending" | "active" | "terminated" | "completed";
  hourlyRate: number;
  termsAcceptedByWorker: boolean;
  startDate: string;
  schedule?: ScheduleDay[];
  frequency?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
  termsAcceptedAt?: string;
}

interface AgreementsState {
  items: Agreement[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: AgreementsState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

// Async thunks
export const fetchAgreements = createAsyncThunk(
  "agreements/fetchAgreements",
  async (
    payload: { page?: number; limit?: number; status?: string } = {},
    { getState },
  ) => {
    const state = getState() as { agreements: AgreementsState };
    const params: any = {
      page: payload.page ?? state.agreements.page,
      limit: payload.limit ?? state.agreements.limit,
    };
    if (payload.status && payload.status !== "all") {
      params.status = payload.status;
    }
    const response = await api.get("agreement", { params });
    const agreements = response.data.data.agreements;
    const pagination = response.data.data.pagination || {};
    return {
      data: agreements,
      total: pagination.total ?? agreements.length,
      totalPages: pagination.totalPages ?? 1,
      page: pagination.page ?? params.page,
      limit: pagination.limit ?? params.limit,
    };
  },
);

export const getAgreementsByClient = createAsyncThunk(
  "agreements/getAgreementsByClient",
  async (
    payload: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {},
    { getState },
  ) => {
    const state = getState() as { agreements: AgreementsState };
    const params: any = {
      page: payload.page ?? state.agreements.page,
      limit: payload.limit ?? state.agreements.limit,
    };
    if (payload.status && payload.status !== "all") {
      params.status = payload.status;
    }
    if (payload.search) {
      params.search = payload.search;
    }
    const response = await api.get("agreement/client", { params });
    const agreements = response.data.data.agreements;
    const pagination = response.data.data.pagination || {};
    return {
      data: agreements,
      total: pagination.total ?? agreements.length,
      totalPages: pagination.totalPages ?? 1,
      page: pagination.page ?? params.page,
      limit: pagination.limit ?? params.limit,
    };
  },
);
export const getAgreementsByWorker = createAsyncThunk(
  "agreements/getAgreementsByWorker",
  async (
    payload: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {},
    { getState },
  ) => {
    const state = getState() as { agreements: AgreementsState };
    const params: any = {
      page: payload.page ?? state.agreements.page,
      limit: payload.limit ?? state.agreements.limit,
    };
    if (payload.status && payload.status !== "all") {
      params.status = payload.status;
    }

    if (payload.search) {
      params.search = payload.search;
    }

    const response = await api.get("agreement/worker", { params });
    const agreements = response.data.data.agreements;
    const pagination = response.data.data.pagination || {};
    return {
      data: agreements,
      total: pagination.total ?? agreements.length,
      totalPages: pagination.totalPages ?? 1,
      page: pagination.page ?? params.page,
      limit: pagination.limit ?? params.limit,
    };
  },
);

export const updateAgreementStatus = createAsyncThunk(
  "agreements/updateAgreementStatus",
  async (payload: { id: string; status: string }) => {
    const response = await api.patch(`agreement/${payload.id}/accept`, {
      status: payload.status,
    });
    return response.data.data;
  },
);

export const terminateAgreement = createAsyncThunk(
  "agreements/terminateAgreement",
  async (
    { id, terminationReason }: { id: string; terminationReason: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`agreement/${id}/terminate`, {
        terminationReason,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to terminate agreement",
      );
    }
  },
);

export const getAgreementById = createAsyncThunk(
  "agreements/getAgreementById",
  async (agreementId: string) => {
    const res = await api.get(`agreement/${agreementId}`);

    return res.data.data;
  },
);

export const editAgreement = createAsyncThunk(
  "agreements/editAgreement",
  async (payload: {
    agreementId: string;
    startDate?: string;
    schedule?: ScheduleDay[];
  }) => {
    const { agreementId, ...updates } = payload;
    const response = await api.patch(`agreement/edit/${agreementId}`, updates);
    return response.data.data;
  },
);

export const agreementsSlice = createSlice({
  name: "agreements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgreements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgreements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page ?? state.page;
        state.limit = action.payload.limit ?? state.limit;
        state.totalPages = action.payload.totalPages ?? state.totalPages;
      })
      .addCase(fetchAgreements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch agreements";
      })
      .addCase(getAgreementsByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page ?? state.page;
        state.limit = action.payload.limit ?? state.limit;
        state.totalPages = action.payload.totalPages ?? state.totalPages;
      })
      .addCase(getAgreementsByWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page ?? state.page;
        state.limit = action.payload.limit ?? state.limit;
        state.totalPages = action.payload.totalPages ?? state.totalPages;
      })
      .addCase(updateAgreementStatus.fulfilled, (state, action) => {
        const updatedAgreement = action.payload;
        state.items = state.items.map((agreement) => {
          if (agreement._id === updatedAgreement._id) {
            return updatedAgreement;
          }
          return agreement;
        });
      })

      .addCase(terminateAgreement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(terminateAgreement.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.items = state.items.map((agreement) =>
          agreement._id === updated._id ? updated : agreement,
        );
      })
      .addCase(terminateAgreement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAgreementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAgreementById.fulfilled, (state, action) => {
        state.loading = false;

        const updatedAgreement = action.payload;

        const existingIndex = state.items.findIndex(
          (agreement) => agreement._id === updatedAgreement._id,
        );

        if (existingIndex !== -1) {
          state.items[existingIndex] = updatedAgreement;
        } else {
          state.items.push(updatedAgreement); // important
        }
      })
      .addCase(getAgreementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch agreement";
      })
      .addCase(editAgreement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAgreement.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.items = state.items.map((agreement) =>
          agreement._id === updated._id ? updated : agreement,
        );
      })
      .addCase(editAgreement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to edit agreement";
      });
  },
});

export default agreementsSlice.reducer;
