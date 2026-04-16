import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "worker" | "client";
  avatar?: string;
  isVerified: boolean;
  status: "active" | "pending" | "suspended";
  isNdisProvider?: boolean;
  logout?: () => void;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logoutmessage?: string;
  loginmessage?: string;
  role?: string;
  forgotemail?: string;
  forgotMessage?: string | null;
  resetMessage?: string | null;
  mee: any | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  logoutmessage: undefined,
  loginmessage: undefined,
  role: undefined,
  forgotemail: undefined,
  forgotMessage: undefined,
  mee: null,
};

// Mock async thunk
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      // API call would go here
      let loginmessage: string | undefined;
      let role: string | undefined;
      const response = await api.post("/users/login", credentials);
      // Expected API shape:
      // { success: true, statusCode: 200, message, data: { user, token } }
      const respData = response.data;
      // If API indicates failure, reject so UI receives the error
      if (respData && respData.success === false) {
        return rejectWithValue(respData.message || "Login failed");
      }
      const payload = respData?.data;
      const token = payload?.token;
      const user = payload?.user;
      role = user?.role;
      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
      }
      loginmessage = respData?.message;
      return { data: user, token, loginmessage, role };
    } catch (error: any) {
      // Axios error may contain response.data.message
      const message =
        error?.response?.data?.message || error?.message || "Login failed";
      return rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  let logoutmessage: string | undefined;
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      logoutmessage = "Logout successful";
    }
  } catch (error: any) {
    logoutmessage = `Logout failed ${error?.message ?? String(error)}`;
  }

  return logoutmessage;
});

// Register async thunk
export const register = createAsyncThunk(
  "auth/register",
  async (userData: any, { rejectWithValue }) => {
    try {
      // API call would go here
      const response = await api.post("users/register", userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  },
);

export const getmee = createAsyncThunk(
  "auth/getmee",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/me");
      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch user data";
      return rejectWithValue(message);
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    passwordData: { currentPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put("/users/change-password", passwordData);
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to change password";
      return rejectWithValue(message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/forgot-password", { email });
      const respData = response.data;
      if (respData && respData.success === false) {
        return rejectWithValue(respData.message || "Email not found");
      }
      return {
        message: respData?.message ?? "OTP has been sent to your email",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initiate password reset";
      return rejectWithValue(message);
    }
  },
);

export const checkotp = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/users/verify-otp", { email, otp });
      const respData = response.data;
      if (respData && respData.success === false) {
        return rejectWithValue(respData.message || "OTP verification failed");
      }
      return respData;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed";
      return rejectWithValue(message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPasswordPerform",
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/users/reset-password", {
        token,
        newPassword,
      });
      const respData = response.data;
      if (respData && respData.success === false) {
        return rejectWithValue(respData.message || "Failed to reset password");
      }
      return { message: respData?.message ?? "Password has been reset" };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password";
      return rejectWithValue(message);
    }
  },
);

export const resetPasswordByEmail = createAsyncThunk(
  "auth/resetPasswordByEmail",
  async (
    { email, newPassword }: { email: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/users/reset-password", {
        email,
        newPassword,
      });
      const respData = response.data;
      if (respData && respData.success === false) {
        return rejectWithValue(respData.message || "Failed to reset password");
      }
      return {
        message: respData?.message ?? "Password has been reset successfully",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password";
      return rejectWithValue(message);
    }
  },
);

export const resentemail = createAsyncThunk(
  "auth/resentemail",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/resent-email", { email });
      const respData = response.data;
      if (respData && respData.success === false) {
        return rejectWithValue(respData.message || "Failed to resent email");
      }
      return { message: respData?.message ?? "Email has been resent" };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resent email";
      return rejectWithValue(message);
    }
  },
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/verify-email?token=${token}`);
      const respData = response.data;
      if (respData && respData.success === false) {
        return rejectWithValue(respData.message || "Failed to verify token");
      }
      return { message: respData?.message ?? "Token has been verified" };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify token";
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.loginmessage = action.payload.loginmessage;
        state.role = action.payload.role;
        state.user = action.payload.data as User;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        // Prefer payload from rejectWithValue, fallback to action.error.message
        state.error =
          (action.payload as string) ?? action.error?.message ?? "Login failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.mee = null;
        state.isAuthenticated = false;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload as User;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getmee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getmee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user as User;
        state.mee = action.payload; // Store full { user, profile }
      })
      .addCase(getmee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.forgotMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forgotMessage =
          action.payload?.message ?? "OTP has been sent to your email";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.forgotMessage = null;
        state.error =
          (action.payload as string) ??
          action.error?.message ??
          "Failed to initiate password reset";
      })
      .addCase(checkotp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkotp.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(checkotp.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ??
          action.error?.message ??
          "OTP verification failed";
      });

    // reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetMessage =
          action.payload?.message ?? "Password has been reset";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.resetMessage = null;
        state.error =
          (action.payload as string) ??
          action.error?.message ??
          "Failed to reset password";
      })
      .addCase(resetPasswordByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(resetPasswordByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetMessage =
          action.payload?.message ?? "Password has been reset";
      })
      .addCase(resetPasswordByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.resetMessage = null;
        state.error =
          (action.payload as string) ??
          action.error?.message ??
          "Failed to reset password";
      })
      .addCase(resentemail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(resentemail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetMessage = action.payload?.message ?? "Email has been resent";
      })
      .addCase(resentemail.rejected, (state, action) => {
        state.isLoading = false;
        state.resetMessage = null;
        state.error =
          (action.payload as string) ??
          action.error?.message ??
          "Failed to resent email";
      })
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetMessage =
          action.payload?.message ?? "Token has been verified";
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.resetMessage = null;
        state.error =
          (action.payload as string) ??
          action.error?.message ??
          "Failed to verify token";
      });
  },
});

export default authSlice.reducer;
