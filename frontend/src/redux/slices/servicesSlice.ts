import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from "@/lib/axios"

export interface Service {
    _id: string;
    name: string;
    code: string;
    categories: Array<string>;
    status: boolean;
    filter: string;
    total: string;
    createdAt: string;
    updatedAt: string;
}

interface ServicesState {
    items: Service[];
    loading: boolean;
    error: string | null;
    filter: string;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const initialState: ServicesState = {
    items: [],
    loading: false,
    error: null,
    filter: 'all',
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};



// Async thunks
export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async (
        payload: { page?: number; limit?: number } = {},
        { getState }
    ) => {
        const state = getState() as { services: ServicesState };
        const filter = state.services.filter;
        const params: any = { page: payload.page ?? state.services.page, limit: payload.limit ?? state.services.limit };
        if (filter && filter !== 'all') {
            // API expects a boolean for status. Accept 'active'|'inactive' from UI and convert.
            if (filter === 'active') params.status = true;
            else if (filter === 'inactive') params.status = false;
            else if (filter === 'true' || filter === 'false') params.status = filter === 'true';
            else params.status = filter;
        }
        const response = await api.get('service', { params });
        const services = response.data.data.services;
        const pagination = response.data.data.pagination || {};
        return {
            data: services,
            total: pagination.total ?? services.length,
            totalPages: pagination.totalPages ?? 1,
            page: pagination.page ?? params.page,
            limit: pagination.limit ?? params.limit,
        };
    }
);

export const createService = createAsyncThunk(
    'services/createService',
    async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
        // TODO: Replace with actual API call
        const response = await api.post('service', serviceData);
        return response.data.data;

    }
);

export const updateService = createAsyncThunk(
    'services/updateService',
    async ({ id, data }: { id: string; data: Partial<Service> }) => {
        // Send minimal payload expected by backend
        const response = await api.put(`service/${id}`, data);
        return response.data.data;
    }
);

export const deleteService = createAsyncThunk(
    'services/deleteService',
    async (id: string) => {
        // TODO: Replace with actual API call
        await api.delete(`service/${id}`);

        // await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: DELETE /api/admin/services/' + id);
        return id;
    }
);

export const toggleServiceStatus = createAsyncThunk(
    'services/toggleServiceStatus',
    async (service: Service) => {
        // Send full service object with updated status so backend gets all fields
        const response = await api.put(`service/${service._id}`, service as any);
        return response.data.data;
    }
);

const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setFilter(state, action: PayloadAction<string>) {
            state.filter = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch services
            .addCase(fetchServices.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.total = action.payload.total;
                state.page = action.payload.page ?? state.page;
                state.limit = action.payload.limit ?? state.limit;
                state.totalPages = action.payload.totalPages ?? state.totalPages;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch services';
            })
            // Create service
            .addCase(createService.pending, (state) => {
                state.loading = true;
            })
            .addCase(createService.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create service';
            })
            // Update service
            .addCase(updateService.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateService.fulfilled, (state, action) => {
                state.loading = false;
                const payloadAny: any = action.payload;
                const index = state.items.findIndex(srv => srv._id === payloadAny._id || srv._id === payloadAny.id);
                if (index !== -1) {
                    state.items[index] = payloadAny;
                }
            })
            .addCase(updateService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update service';
            })
            // Delete service
            .addCase(deleteService.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.loading = false;
                const payloadAny: any = action.payload;
                const removedId = typeof payloadAny === 'string' ? payloadAny : (payloadAny._id || payloadAny.id);
                state.items = state.items.filter(srv => srv._id !== removedId);
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete service';
            })
            // Toggle status
            .addCase(toggleServiceStatus.fulfilled, (state, action) => {
                const service = state.items.find(srv => srv._id === action.payload._id || srv._id === action.payload.id);
                if (service) {
                    service.status = action.payload.status;
                    service.updatedAt = new Date().toISOString();
                }
            });
    },
});

export const { setFilter } = servicesSlice.actions;

export default servicesSlice.reducer;
