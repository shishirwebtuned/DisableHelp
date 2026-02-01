import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DashboardVariant = 'classic' | 'modern' | 'enterprise';

interface UIState {
    dashboardVariant: DashboardVariant;
    sidebarOpen: boolean;
    theme: 'light' | 'dark'; // Add theme support if not handled by shadcn theme provider
}

// Save state to localStorage (only used on client after actions)
const saveStateToLocalStorage = (state: UIState) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('uiState', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save UI state to localStorage:', error);
        }
    }
};

// Deterministic initial state for server and initial client render
const initialState: UIState = {
    dashboardVariant: 'classic',
    sidebarOpen: true,
    theme: 'light',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setDashboardVariant(state, action: PayloadAction<DashboardVariant>) {
            state.dashboardVariant = action.payload;
            saveStateToLocalStorage(state);
        },
        toggleSidebar(state) {
            state.sidebarOpen = !state.sidebarOpen;
            saveStateToLocalStorage(state);
        },
        setSidebarOpen(state, action: PayloadAction<boolean>) {
            state.sidebarOpen = action.payload;
            saveStateToLocalStorage(state);
        },
        setTheme(state, action: PayloadAction<'light' | 'dark'>) {
            state.theme = action.payload;
            saveStateToLocalStorage(state);
        },
    },
});

export const { setDashboardVariant, toggleSidebar, setSidebarOpen, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
