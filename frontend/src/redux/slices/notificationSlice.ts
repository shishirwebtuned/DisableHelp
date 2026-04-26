import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { RootState } from "../store";

export interface Notification {
  _id: string;
  type: "message" | "invoice" | "agreement" | "job" | "system";
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  sender?: {
    _id: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
  };
  createdAt: string;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await api.get("/notifications");
    return res.data.data.notifications;
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data.data.count;
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId: string) => {
    const res = await api.patch(
      `/notifications/${notificationId}/read`,
      {},
      { silent: true },
    );
    return res.data.data.notification;
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async () => {
    await api.patch("/notifications/mark-all-read");
  },
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId: string) => {
    await api.delete(`/notifications/${notificationId}`);
    return notificationId;
  },
);

export const sendNotificationByAdmin = createAsyncThunk(
  "notifications/sendByAdmin",
  async ({
    recipientId,
    title,
    message,
  }: {
    recipientId: string;
    title: string;
    message: string;
  }) => {
    const res = await api.post("/notifications/admin/send", {
      recipientId,
      title,
      message,
    });
    return res.data.data.notification;
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      // if (!action.payload.read) {
      state.unreadCount += 1;
      // }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(
          (n: Notification) => !n.read,
        ).length;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (n) => n._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const wasUnread = state.items.find(
          (n) => n._id === action.payload && !n.read,
        );
        state.items = state.items.filter((n) => n._id !== action.payload);
        if (wasUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

export const selectAllUnreadCount = (state: RootState) =>
  state.notifications.items.filter((n) => !n.read).length;

export const selectMessageUnreadCount = (state: RootState) =>
  state.notifications.items.filter((n) => n.type === "message" && !n.read)
    .length;
