import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface ActiveUser {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  address?: {
    line1?: string;
    suburb?: string;
    state?: string;
    postalCode?: string;
  };
  timezone?: string;
  isVerified?: boolean;
  approved?: boolean;
}

interface ActiveConnectionsState {
  workers: ActiveUser[];
  clients: ActiveUser[];
  loadingWorkers: boolean;
  loadingClients: boolean;
  errorWorkers: string | null;
  errorClients: string | null;
}

const initialState: ActiveConnectionsState = {
  workers: [],
  clients: [],
  loadingWorkers: false,
  loadingClients: false,
  errorWorkers: null,
  errorClients: null,
};

// Client: fetch my active workers
export const fetchMyWorkers = createAsyncThunk(
  "activeConnections/fetchMyWorkers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("users/my/workers");
      return response.data.data.workers;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch workers",
      );
    }
  },
);

// Worker: fetch my active clients
export const fetchMyClients = createAsyncThunk(
  "activeConnections/fetchMyClients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("users/my/clients");
      return response.data.data.clients;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch clients",
      );
    }
  },
);

const activeConnectionsSlice = createSlice({
  name: "activeConnections",
  initialState,
  reducers: {
    clearWorkers(state) {
      state.workers = [];
    },
    clearClients(state) {
      state.clients = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch my workers
      .addCase(fetchMyWorkers.pending, (state) => {
        state.loadingWorkers = true;
        state.errorWorkers = null;
      })
      .addCase(fetchMyWorkers.fulfilled, (state, action) => {
        state.loadingWorkers = false;
        state.workers = action.payload;
      })
      .addCase(fetchMyWorkers.rejected, (state, action) => {
        state.loadingWorkers = false;
        state.errorWorkers = action.payload as string;
      })

      // fetch my clients
      .addCase(fetchMyClients.pending, (state) => {
        state.loadingClients = true;
        state.errorClients = null;
      })
      .addCase(fetchMyClients.fulfilled, (state, action) => {
        state.loadingClients = false;
        state.clients = action.payload;
      })
      .addCase(fetchMyClients.rejected, (state, action) => {
        state.loadingClients = false;
        state.errorClients = action.payload as string;
      });
  },
});

export const { clearWorkers, clearClients } = activeConnectionsSlice.actions;
export default activeConnectionsSlice.reducer;
