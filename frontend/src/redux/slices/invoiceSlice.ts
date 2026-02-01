import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Invoice } from '@/types';
import api from '@/lib/axios';

interface InvoiceState {
    items: Invoice[];
    loading: boolean;
    error: string | null;
}

const initialState: InvoiceState = {
    items: [],
    loading: false,
    error: null,
};

// Async thunk for fetching invoices
export const fetchInvoices = createAsyncThunk(
    'invoices/fetchInvoices',
    async (userId?: string) => {
        const url = userId ? `/invoices?userId=${userId}` : '/invoices';
        const response = await api.get(url);
        return response.data;
    }
);

// Async thunk for submitting invoice
export const submitInvoice = createAsyncThunk(
    'invoices/submitInvoice',
    async (invoiceData: Omit<Invoice, 'id' | 'status' | 'submittedAt'>) => {
        const response = await api.post('/invoices', invoiceData);
        return response.data;
    }
);

// Async thunk for updating invoice
export const updateInvoice = createAsyncThunk(
    'invoices/updateInvoice',
    async (invoice: Invoice) => {
        const response = await api.put(`/invoices/${invoice.id}`, invoice);
        return response.data;
    }
);

// Async thunk for deleting invoice
export const deleteInvoice = createAsyncThunk(
    'invoices/deleteInvoice',
    async (id: string) => {
        await api.delete(`/invoices/${id}`);
        return id;
    }
);

// Async thunk for updating invoice status (admin)
export const updateInvoiceStatus = createAsyncThunk(
    'invoices/updateInvoiceStatus',
    async ({ invoiceId, status, adminNotes }: { invoiceId: string; status: Invoice['status']; adminNotes?: string }) => {
        const response = await api.patch(`/admin/invoices/${invoiceId}/status`, { status, adminNotes });
        return response.data;
    }
);

const invoiceSlice = createSlice({
    name: 'invoices',
    initialState,
    reducers: {
        setInvoices(state, action: PayloadAction<Invoice[]>) {
            state.items = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch invoices';
            })
            .addCase(submitInvoice.pending, (state) => {
                state.loading = true;
            })
            .addCase(submitInvoice.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(submitInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to submit invoice';
            })
            .addCase(updateInvoice.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateInvoice.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(inv => inv.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update invoice';
            })
            .addCase(deleteInvoice.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteInvoice.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(inv => inv.id !== action.payload);
            })
            .addCase(deleteInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete invoice';
            })
            .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
                const invoice = state.items.find(inv => inv.id === action.payload.invoiceId);
                if (invoice) {
                    invoice.status = action.payload.status;
                    invoice.adminNotes = action.payload.adminNotes;
                    invoice.processedAt = action.payload.processedAt;
                }
            });
    },
});

export const { setInvoices } = invoiceSlice.actions;
export default invoiceSlice.reducer;
