import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { WorkerProfile, ClientProfile } from "@/types";
import api from "@/lib/axios";
import { WorkerProfileSchema } from "@/types/workerProfileSchema";

interface ProfileState {
  workerProfile: WorkerProfile | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  workerProfile: null,
  clientProfile: null,
  loading: false,
  error: null,
};

export const updateWorkerProfile = createAsyncThunk(
  "profile/updateWorkerProfile",
  async (
    profileData: Partial<WorkerProfile> | FormData,
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch("/profile/worker", profileData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update profile" });
    }
  },
);

// Submit worker profile to API
export const submitWorkerProfile = createAsyncThunk(
  "profile/submitWorkerProfile",
  async (profileData: WorkerProfileSchema, { rejectWithValue }) => {
    try {
      const response = await api.put("/profile/worker", profileData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to submit profile" });
    }
  },
);

export const updateClientProfile = createAsyncThunk(
  "profile/updateClientProfile",
  async (
    profileData: Partial<ClientProfile> | FormData,
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch("/profile/client", profileData);
      return response.data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update client profile" });
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setWorkerProfile(state, action: PayloadAction<WorkerProfile>) {
      state.workerProfile = action.payload;
    },
    setClientProfile(state, action: PayloadAction<ClientProfile>) {
      state.clientProfile = action.payload;
    },
    updateProfileCompleteness(state, action: PayloadAction<number>) {
      if (state.workerProfile) {
        state.workerProfile.completeness = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateWorkerProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateWorkerProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.workerProfile) {
          state.workerProfile = { ...state.workerProfile, ...action.payload };
        }
      })
      .addCase(updateWorkerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update profile";
      })
      .addCase(submitWorkerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitWorkerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Optionally update the worker profile with response data
        if (action.payload && action.payload.data) {
          state.workerProfile = action.payload.data;
        }
      })
      .addCase(submitWorkerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to submit profile";
      })
      .addCase(updateClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.clientProfile = {
          ...state.clientProfile,
          ...action.payload,
        } as ClientProfile;
      })
      .addCase(updateClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to update client profile";
      });
  },
});

export const { setWorkerProfile, setClientProfile, updateProfileCompleteness } =
  profileSlice.actions;
export default profileSlice.reducer;
