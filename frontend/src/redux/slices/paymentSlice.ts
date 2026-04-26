import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface UserBasic {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
}
export interface Payment {
  _id: string;
  worker: string | UserBasic;
  client: string | UserBasic;
  amount: number;
  lateFee: number;
  totalAmount: number;
  paymentDate: string;
  nextPaymentDate: string;
  status: "successful" | "pending" | "failed";
  paymentMethod: string;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentDue {
  baseAmount: number;
  lateFee: number;
  amountDue: number;
  lastPaymentDate: string | null;
  nextPaymentDate: string;
}

interface PaymentsState {
  items: Payment[];
  paymentDue: PaymentDue | null;
  orderId: string | null;
  approveLink: string | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

const initialState: PaymentsState = {
  items: [],
  paymentDue: null,
  orderId: null,
  approveLink: null,
  loading: false,
  error: null,
  pagination: null,
};

export const createPaymentOrder = createAsyncThunk(
  "payments/createPaymentOrder",
  async (payload: {
    workerId: string;
    clientId: string;
    paymentMethod: string;
  }) => {
    const response = await api.post("payments/create", payload);
    return response.data.data;
  },
);

export const capturePayment = createAsyncThunk(
  "payments/capturePayment",
  async (payload: {
    orderId: string;
    workerId: string;
    clientId: string;
    paymentMethod: string;
  }) => {
    const response = await api.post("payments/capture", payload);
    return response.data.data;
  },
);

export const fetchAllPayments = createAsyncThunk(
  "payments/fetchAllPayments",
  async (params?: any) => {
    const response = await api.get(`payments/all`, { params });
    return response.data.data;
  },
);

export const fetchPaymentDue = createAsyncThunk(
  "payments/fetchPaymentDue",
  async (payload: { workerId: string; clientId: string }) => {
    const response = await api.get(
      `payments/due/${payload.workerId}/${payload.clientId}`,
    );
    return response.data.data;
  },
);

export const fetchWorkerPayments = createAsyncThunk(
  "payments/fetchWorkerPayments",
  async (workerId: string) => {
    const response = await api.get(`payments/worker/${workerId}`);
    return response.data.data;
  },
);

export const fetchClientPayments = createAsyncThunk(
  "payments/fetchClientPayments",
  async (clientId: string) => {
    const response = await api.get(`payments/client/${clientId}`);
    return response.data.data;
  },
);

export const fetchMyPayments = createAsyncThunk(
  "payments/fetchMyPayments",
  async (params?: any) => {
    const response = await api.get(`payments/me`, { params });
    return response.data.data;
  },
);

export const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPaymentOrder: (state) => {
      state.orderId = null;
      state.approveLink = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderId = action.payload.orderId;
        state.approveLink = action.payload.approveLink;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create payment";
      })
      .addCase(capturePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.orderId = null;
        state.approveLink = null;
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Payment capture failed";
      })
      .addCase(fetchPaymentDue.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentDue.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentDue = action.payload;
      })
      .addCase(fetchPaymentDue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch payment due";
      })
      .addCase(fetchWorkerPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkerPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWorkerPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch worker payments";
      })
      .addCase(fetchClientPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClientPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch client payments";
      })
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch payments";
      })
      .addCase(fetchMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch your payments";
      });
  },
});

export const { clearPaymentOrder } = paymentsSlice.actions;

export default paymentsSlice.reducer;
