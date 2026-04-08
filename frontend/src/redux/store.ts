import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import jobsReducer from "./slices/jobsSlice";
import applicationsReducer from "./slices/applicationsSlice";
import agreementsReducer from "./slices/agreementsSlice";
import invoiceReducer from "./slices/invoiceSlice";
import uiReducer from "./slices/uiSlice";
import timesheetsReducer from "./slices/timesheetsSlice";
import servicesReducer from "./slices/servicesSlice";
import sessionsReducer from "./slices/sessionsSlice";
import usersReducer from "./slices/usersSlice";
import settingsReducer from "./slices/settingsSlice";
import scheduleReducer from "./slices/scheduleSlice";
import reviewsReducer from "./slices/reviewsSlice";
import chatReducer from "./slices/chatSlice";
import messageReducer from "./slices/messageSlice";
import activeConnectionsReducer from "./slices/activeConnectionsSlice";
import notificationReducer from "./slices/notificationSlice";
import paymentReducer from "./slices/paymentSlice";
import inviteReducer from "./slices/inviteSlice";
import { socketMiddleware } from "@/lib/socketMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    agreements: agreementsReducer,
    invoices: invoiceReducer,
    ui: uiReducer,
    timesheets: timesheetsReducer,
    services: servicesReducer,
    sessions: sessionsReducer,
    users: usersReducer,
    settings: settingsReducer,
    schedule: scheduleReducer,
    reviews: reviewsReducer,
    chat: chatReducer,
    message: messageReducer,
    activeConnections: activeConnectionsReducer,
    notifications: notificationReducer,
    payments: paymentReducer,
    invite: inviteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
