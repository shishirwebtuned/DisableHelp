import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface Session {
  _id: string;
  agreement: string;
  job: {
    _id: string;
    title: string;
  };
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  worker: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  hourlyRate: number;
  totalAmount: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  completedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  cancelledByRole?: string;
  createdAt: string;
  updatedAt: string;
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

export const fetchSessionsByUser = createAsyncThunk(
  "session/fetchSessionsByUser",
  async () => {
    const response = await api.get("/session/user");
    return response.data.data.sessions;
  },
);

export const createSession = createAsyncThunk(
  "session/createSession",
  async (sessionData: {
    agreementId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.post("/api/sessions", sessionData);
    return response.data.data;
  },
);

export const updateSession = createAsyncThunk(
  "sessions/updateSession",
  async ({ id, updates }: { id: string; updates: Partial<Session> }) => {
    const response = await api.put(`/api/sessions/${id}`, updates);
    return response.data.data;
  },
);

export const rescheduleSession = createAsyncThunk(
  "sessions/rescheduleSession",
  async ({ id, date }: { id: string; date: string }) => {
    const response = await api.patch(`/api/sessions/${id}/reschedule`, {
      date,
    });
    return response.data.data;
  },
);

export const cancelSession = createAsyncThunk(
  "session/terminate",
  async ({
    sessionId,
    cancelledReason,
  }: {
    sessionId: string;
    cancelledReason: string;
  }) => {
    const response = await api.patch(`/api/session/${sessionId}/terminate`, {
      cancelledReason: cancelledReason,
    });
    return response.data.data;
  },
);

export const fetchSessionById = createAsyncThunk(
  "session/fetchSessionById",
  async (sessionId: string) => {
    const response = await api.get(`/session/${sessionId}`);
    return response.data.data.sessions;
  },
);

const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessionsByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessionsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSessionsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch sessions";
      })

      // fetch session by id
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.items.findIndex(
          (s) => s._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
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
        state.error = action.error.message || "Failed to create session";
      })
      // Update session
      .addCase(updateSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update session";
      })
      // Reschedule session
      .addCase(rescheduleSession.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Cancel session
      .addCase(cancelSession.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default sessionsSlice.reducer;
