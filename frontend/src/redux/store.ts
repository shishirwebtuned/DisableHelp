import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import jobsReducer from './slices/jobsSlice';
import applicationsReducer from './slices/applicationsSlice';
import agreementsReducer from './slices/agreementsSlice';
import invoiceReducer from './slices/invoiceSlice';
import messagesReducer from './slices/messagesSlice';
import uiReducer from './slices/uiSlice';
import timesheetsReducer from './slices/timesheetsSlice';
import servicesReducer from './slices/servicesSlice';
import sessionsReducer from './slices/sessionsSlice';
import usersReducer from './slices/usersSlice';
import settingsReducer from './slices/settingsSlice';
import scheduleReducer from './slices/scheduleSlice';
import reviewsReducer from './slices/reviewsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        jobs: jobsReducer,
        applications: applicationsReducer,
        agreements: agreementsReducer,
        invoices: invoiceReducer,
        messages: messagesReducer,
        ui: uiReducer,
        timesheets: timesheetsReducer,
        services: servicesReducer,
        sessions: sessionsReducer,
        users: usersReducer,
        settings: settingsReducer,
        schedule: scheduleReducer,
        reviews: reviewsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
