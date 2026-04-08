import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

const baseApi = "invite";

interface InviteState {
  loading: boolean;
  checking: boolean;
  error: string | null;
  success: boolean;
  response: any;
  invited: boolean;
}

export const sendInvite = createAsyncThunk(
  "invite/sendInvite",
  async (
    { jobId, receiverId }: { jobId: string; receiverId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post(`${baseApi}/worker`, {
        jobId,
        receiverId,
      });

      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send invite",
      );
    }
  },
);

export const checkInvitation = createAsyncThunk(
  "invite/checkInvitation",
  async (
    { jobId, receiverId }: { jobId: string; receiverId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(
        `${baseApi}/check?jobId=${jobId}&receiverId=${receiverId}`,
      );

      return res.data.data.invited;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to check invite",
      );
    }
  },
);

const initialState: InviteState = {
  loading: false,
  checking: false,
  error: null,
  success: false,
  response: null,
  invited: false,
};

const inviteSlice = createSlice({
  name: "invite",
  initialState,
  reducers: {
    resetInviteState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.response = null;
      state.invited = false;
      state.checking = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendInvite.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.response = action.payload;
        state.invited = true;
      })
      .addCase(sendInvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(checkInvitation.pending, (state) => {
        state.checking = true;
      })

      .addCase(checkInvitation.fulfilled, (state, action) => {
        state.checking = false;
        state.invited = action.payload;
      })

      .addCase(checkInvitation.rejected, (state, action) => {
        state.checking = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetInviteState } = inviteSlice.actions;
export default inviteSlice.reducer;
