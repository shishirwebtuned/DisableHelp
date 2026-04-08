import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface Invoice {
  _id: string;
  worker: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  invoiceNumber: string;
  totalAmount: number;
  status: "pending" | "approved" | "declined";
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  file?: {
    url: string;
    public_id: string;
    originalName?: string;
    mimeType?: string;
  };
  declineReason?: string;
  approvedAt?: string;
  declinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InvoiceState {
  items: Invoice[];
  selectedInvoice: Invoice | null;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  items: [],
  selectedInvoice: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  error: null,
};

const baseApi = "invoice";

// Admin: get all invoices
export const fetchAllInvoices = createAsyncThunk(
  "invoices/fetchAll",
  async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get(`${baseApi}`, { params });
    return response.data.data;
  },
);

// Worker: get my submitted invoices
export const fetchMyInvoicesAsWorker = createAsyncThunk(
  "invoices/fetchMyAsWorker",
  async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get(`${baseApi}/my/worker`, { params });
    return response.data.data;
  },
);

// Client: get invoices submitted to me
export const fetchMyInvoicesAsClient = createAsyncThunk(
  "invoices/fetchMyAsClient",
  async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get(`${baseApi}/my/client`, { params });
    return response.data.data;
  },
);

// Shared: get single invoice
export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchById",
  async (invoiceId: string) => {
    const response = await api.get(`${baseApi}/${invoiceId}`);
    return response.data.data.invoice;
  },
);

// Worker: create invoice
export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (
    invoiceData: {
      client: string;
      totalAmount: number;
      date?: string;
      startTime?: string;
      endTime?: string;
      notes?: string;
      file?: File;
    },
    { rejectWithValue },
  ) => {
    try {
      const fd = new FormData();

      fd.append("client", invoiceData.client);
      fd.append("totalAmount", String(invoiceData.totalAmount));
      if (invoiceData.date) fd.append("date", invoiceData.date);
      if (invoiceData.startTime) fd.append("startTime", invoiceData.startTime);
      if (invoiceData.endTime) fd.append("endTime", invoiceData.endTime);
      if (invoiceData.notes) fd.append("notes", invoiceData.notes);
      if (invoiceData.file) fd.append("invoiceFile", invoiceData.file);

      const response = await api.post(`${baseApi}`, fd);
      return response.data.data.invoice;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create invoice",
      );
    }
  },
);

// Worker: edit invoice
export const editInvoice = createAsyncThunk(
  "invoices/edit",
  async (
    {
      invoiceId,
      data,
    }: {
      invoiceId: string;
      data: {
        totalAmount?: number;
        date?: string;
        startTime?: string;
        endTime?: string;
        notes?: string;
        file?: File;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      let payload: FormData | Record<string, any>;

      if (data.file) {
        // Use FormData when file is present
        const fd = new FormData();
        if (data.totalAmount !== undefined)
          fd.append("totalAmount", String(data.totalAmount));
        if (data.date) fd.append("date", data.date);
        if (data.startTime) fd.append("startTime", data.startTime);
        if (data.endTime) fd.append("endTime", data.endTime);
        if (data.notes !== undefined) fd.append("notes", data.notes);
        fd.append("invoiceFile", data.file);
        payload = fd;
      } else {
        // Plain JSON when no file
        const { file, ...rest } = data;
        payload = rest;
      }

      const response = await api.put(`${baseApi}/${invoiceId}`, payload);
      return response.data.data.invoice;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update invoice",
      );
    }
  },
);

// Worker: delete invoice
export const deleteInvoice = createAsyncThunk(
  "invoices/delete",
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      await api.delete(`${baseApi}/${invoiceId}`);
      return invoiceId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete invoice",
      );
    }
  },
);

// Client: approve invoice
export const approveInvoice = createAsyncThunk(
  "invoices/approve",
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${baseApi}/${invoiceId}/approve`);
      return response.data.data.invoice;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to approve invoice",
      );
    }
  },
);

// Client: decline invoice
export const declineInvoice = createAsyncThunk(
  "invoices/decline",
  async (
    { invoiceId, reason }: { invoiceId: string; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`${baseApi}/${invoiceId}/decline`, {
        reason,
      });
      return response.data.data.invoice;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to decline invoice",
      );
    }
  },
);

export const adminUpdateInvoiceStatus = createAsyncThunk(
  "invoices/adminUpdateStatus",
  async (
    {
      invoiceId,
      status,
      declineReason,
    }: {
      invoiceId: string;
      status: "approved" | "declined";
      declineReason?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`${baseApi}/${invoiceId}/admin-status`, {
        status,
        declineReason,
      });
      return response.data.data.invoice;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update invoice status",
      );
    }
  },
);

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearSelectedInvoice(state) {
      state.selectedInvoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all (admin)
      .addCase(fetchAllInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch invoices";
      })

      // fetch my invoices as worker
      .addCase(fetchMyInvoicesAsWorker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyInvoicesAsWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyInvoicesAsWorker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch invoices";
      })

      // fetch my invoices as client
      .addCase(fetchMyInvoicesAsClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyInvoicesAsClient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyInvoicesAsClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch invoices";
      })

      // fetch by id
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch invoice";
      })

      // create
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // edit
      .addCase(editInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(editInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // delete
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((i) => i._id !== action.payload);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // approve
      .addCase(approveInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(approveInvoice.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // decline
      .addCase(declineInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(declineInvoice.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(adminUpdateInvoiceStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedInvoice?._id === action.payload._id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(adminUpdateInvoiceStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
