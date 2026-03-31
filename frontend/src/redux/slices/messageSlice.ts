import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface Message {
  _id: string;
  chat: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  message: string;
  read: boolean;
  readAt?: string;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageState {
  items: Message[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchMessagesByChat = createAsyncThunk(
  "message/fetchByChat",
  async (
    payload: string | { chatId: string; page?: number; limit?: number },
  ) => {
    const chatId = typeof payload === "string" ? payload : payload.chatId;
    const page = typeof payload === "object" ? (payload.page ?? 1) : 1;
    const limit = typeof payload === "object" ? (payload.limit ?? 10) : 10;

    const res = await api.get(`/message/chat/${chatId}`, {
      params: { page, limit },
    });
    return res.data.data.messages;
  },
);

// Fetch single message by ID
export const fetchMessageById = createAsyncThunk(
  "message/fetchById",
  async (messageId: string) => {
    const res = await api.get(`/message/${messageId}`);
    return res.data.data.messages;
  },
);

// Send message
export const sendMessage = createAsyncThunk(
  "message/send",
  async ({ chatId, message }: { chatId: string; message: string }) => {
    const res = await api.post(
      `/message/${chatId}`,
      { message },
      { silent: true },
    );
    return res.data.data;
  },
);

// Edit message
export const editMessage = createAsyncThunk(
  "message/edit",
  async ({ messageId, message }: { messageId: string; message: string }) => {
    const res = await api.patch(`/message/${messageId}`, { message });
    return res.data.data;
  },
);

// Delete message
export const deleteMessage = createAsyncThunk(
  "message/delete",
  async (messageId: string) => {
    await api.delete(`/message/${messageId}`);
    return messageId;
  },
);

// Mark all messages in chat as read
export const markMessagesRead = createAsyncThunk(
  "message/read",
  async (chatId: string) => {
    await api.patch(`/message/mark-read/${chatId}`, {}, { silent: true });
    return chatId;
  },
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  "message/unreadCount",
  async () => {
    const res = await api.get("/message/unread-count");
    return res.data.data.count;
  },
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    // Socket.IO: new message received
    addMessage: (state, action) => {
      const exists = state.items.find((m) => m._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
        // if (!action.payload.read) {
        //   state.unreadCount += 1;
        // }
      }
    },

    // Socket.IO: message edited
    updateMessage: (state, action) => {
      const index = state.items.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    // Socket.IO: message deleted
    removeMessage: (state, action) => {
      state.items = state.items.filter((m) => m._id !== action.payload);
    },

    // Socket.IO: mark all messages read locally
    markReadLocal: (state) => {
      const unreadBefore = state.items.filter((m) => !m.read).length;
      state.items = state.items.map((m) => ({ ...m, read: true }));
      state.unreadCount = Math.max(0, state.unreadCount - unreadBefore);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages by chat
      .addCase(fetchMessagesByChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessagesByChat.fulfilled, (state, action) => {
        state.loading = false;
        const incoming = action.payload ?? [];

        if (incoming.length === 0) return; // nothing to do

        const isFirstPage =
          typeof action.meta.arg === "string" ||
          (action.meta.arg as any)?.page === undefined ||
          (action.meta.arg as any)?.page <= 1;

        if (isFirstPage) {
          state.items = [...incoming].sort(
            (a: any, b: any) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        } else {
          // Prepend older messages, avoid duplicates
          const existingIds = new Set(state.items.map((m) => m._id));
          const newOnes = incoming.filter((m: any) => !existingIds.has(m._id));
          state.items = [...newOnes, ...state.items];
        }
      })

      // Fetch single message
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
        else state.items.unshift(action.payload);
      })

      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        // state.items.push(action.payload);
      })

      // Edit message
      .addCase(editMessage.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload);
      })

      // Mark messages read
      .addCase(markMessagesRead.fulfilled, (state) => {
        const unreadBefore = state.items.filter((m) => !m.read).length;
        state.items = state.items.map((m) => ({ ...m, read: true }));
        state.unreadCount = Math.max(0, state.unreadCount - unreadBefore);
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { addMessage, updateMessage, removeMessage, markReadLocal } =
  messageSlice.actions;

export default messageSlice.reducer;
