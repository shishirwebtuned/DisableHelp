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

export const updateAdminAccount = createAsyncThunk(
    'settings/updateAdminAccount',
    async (accountData: { email: string; displayName: string }) => {
        const response = await api.put('/admin/settings/account', accountData);
        return response.data;
    }
);

export const updateAdminPassword = createAsyncThunk(
    'settings/updateAdminPassword',
    async (passwordData: { email: string; currentPassword: string; newPassword: string }) => {
        const response = await api.post('/users/change-password', passwordData);
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
