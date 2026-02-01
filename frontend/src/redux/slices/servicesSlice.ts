import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Service {
    id: string;
    name: string;
    description: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ServicesState {
    items: Service[];
    loading: boolean;
    error: string | null;
}

const initialState: ServicesState = {
    items: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async () => {
        // TODO: Replace with actual API call
        // const response = await axios.get('/api/admin/services');
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const mockServices: Service[] = [
            {
                id: 'srv-1',
                name: 'Personal Care',
                description: 'Assistance with daily living activities, bathing, grooming, and dressing',
                status: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'srv-2',
                name: 'Domestic Assistance',
                description: 'Help with household tasks like cleaning, laundry, and meal preparation',
                status: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'srv-3',
                name: 'Community Access',
                description: 'Support for community participation and social activities',
                status: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        console.log('API Call: GET /api/admin/services');
        return mockServices;
    }
);

export const createService = createAsyncThunk(
    'services/createService',
    async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
        // TODO: Replace with actual API call
        // const response = await axios.post('/api/admin/services', serviceData);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const newService: Service = {
            ...serviceData,
            id: `srv-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        console.log('API Call: POST /api/admin/services', serviceData);
        return newService;
    }
);

export const updateService = createAsyncThunk(
    'services/updateService',
    async (service: Service) => {
        // TODO: Replace with actual API call
        // const response = await axios.put(`/api/admin/services/${service.id}`, service);
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 500));

        const updatedService = {
            ...service,
            updatedAt: new Date().toISOString(),
        };

        console.log('API Call: PUT /api/admin/services/' + service.id, service);
        return updatedService;
    }
);

export const deleteService = createAsyncThunk(
    'services/deleteService',
    async (id: string) => {
        // TODO: Replace with actual API call
        // await axios.delete(`/api/admin/services/${id}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('API Call: DELETE /api/admin/services/' + id);
        return id;
    }
);

export const toggleServiceStatus = createAsyncThunk(
    'services/toggleServiceStatus',
    async ({ id, status }: { id: string; status: boolean }) => {
        // TODO: Replace with actual API call
        // const response = await axios.patch(`/api/admin/services/${id}/status`, { status });
        // return response.data;

        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('API Call: PATCH /api/admin/services/' + id + '/status', { status });
        return { id, status };
    }
);

const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch services
            .addCase(fetchServices.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
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
                const index = state.items.findIndex(srv => srv.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
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
                state.items = state.items.filter(srv => srv.id !== action.payload);
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete service';
            })
            // Toggle status
            .addCase(toggleServiceStatus.fulfilled, (state, action) => {
                const service = state.items.find(srv => srv.id === action.payload.id);
                if (service) {
                    service.status = action.payload.status;
                    service.updatedAt = new Date().toISOString();
                }
            });
    },
});

export default servicesSlice.reducer;
