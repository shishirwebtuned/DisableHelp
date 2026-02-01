import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export interface AdminSettings {
    id: string;
    email: string;
    displayName: string;
    maintenanceMode: boolean;
    newUserRegistration: boolean;
    systemAlerts: boolean;
}

export interface PlatformSettings {
    maintenanceMode: boolean;
    newUserRegistration: boolean;
    systemAlerts: boolean;
}

interface SettingsState {
    admin: AdminSettings | null;
    platform: PlatformSettings | null;
    loading: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    admin: null,
    platform: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchAdminSettings = createAsyncThunk(
    'settings/fetchAdminSettings',
    async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    }
);

export const updateAdminAccount = createAsyncThunk(
    'settings/updateAdminAccount',
    async (accountData: { email: string; displayName: string }) => {
        const response = await api.put('/admin/settings/account', accountData);
        return response.data;
    }
);

export const updateAdminPassword = createAsyncThunk(
    'settings/updateAdminPassword',
    async (passwordData: { currentPassword: string; newPassword: string }) => {
        const response = await api.put('/admin/settings/password', passwordData);
        return response.data;
    }
);

export const updatePlatformSettings = createAsyncThunk(
    'settings/updatePlatformSettings',
    async (platformSettings: Partial<PlatformSettings>) => {
        const response = await api.put('/admin/settings/platform', platformSettings);
        return response.data;
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        toggleMaintenanceMode: (state) => {
            if (state.platform) {
                state.platform.maintenanceMode = !state.platform.maintenanceMode;
            }
        },
        toggleNewUserRegistration: (state) => {
            if (state.platform) {
                state.platform.newUserRegistration = !state.platform.newUserRegistration;
            }
        },
        toggleSystemAlerts: (state) => {
            if (state.platform) {
                state.platform.systemAlerts = !state.platform.systemAlerts;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch settings
            .addCase(fetchAdminSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.admin = action.payload.admin;
                state.platform = action.payload.platform;
            })
            .addCase(fetchAdminSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch settings';
            })
            // Update admin account
            .addCase(updateAdminAccount.fulfilled, (state, action) => {
                if (state.admin) {
                    state.admin = { ...state.admin, ...action.payload };
                }
            })
            // Update platform settings
            .addCase(updatePlatformSettings.fulfilled, (state, action) => {
                state.platform = { ...state.platform, ...action.payload };
            });
    },
});

export const { toggleMaintenanceMode, toggleNewUserRegistration, toggleSystemAlerts } = settingsSlice.actions;
export default settingsSlice.reducer;
