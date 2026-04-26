import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface Chat {
  _id: string;

  agreement: string;

  client: {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };

  worker: {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };

  status: "pending" | "active" | "suspended";

  lastMessage?: {
    _id: string;
    message: string;
    sender: string;
    createdAt: string;
  };

  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  items: Chat[];

  activeChat: Chat | null;

  loading: boolean;

  error: string | null;
}

const initialState: ChatState = {
  items: [],

  activeChat: null,

  loading: false,

  error: null,
};

export const fetchMyChats = createAsyncThunk(
  "chat/fetchMyChats",

  async () => {
    const res = await api.get("/chat/my-chats");

    return res.data.data;
  },
);

export const fetchChatById = createAsyncThunk(
  "chat/fetchChatById",

  async (chatId: string) => {
    const res = await api.get(`/chat/${chatId}`);

    return res.data.data;
  },
);

export const updateChatStatus = createAsyncThunk(
  "chat/updateStatus",

  async ({ chatId, status }: { chatId: string; status: string }) => {
    const res = await api.patch(
      `/chat/status/${chatId}`,

      { status },
    );

    return res.data.data;
  },
);

// Admin: fetch all chats
export const fetchAllChats = createAsyncThunk(
  "chat/fetchAllChats",
  async () => {
    const res = await api.get("/chat");
    return res.data.data;
  },
);

// Fetch chats by worker
export const fetchChatsByWorker = createAsyncThunk(
  "chat/fetchChatsByWorker",
  async (workerId: string) => {
    const res = await api.get(`/chat/worker/${workerId}`);
    return res.data.data;
  },
);

// Fetch chats by client
export const fetchChatsByClient = createAsyncThunk(
  "chat/fetchChatsByClient",
  async (clientId: string) => {
    const res = await api.get(`/chat/client/${clientId}`);
    return res.data.data;
  },
);

const chatSlice = createSlice({
  name: "chat",

  initialState,

  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },

    updateLastMessage: (state, action) => {
      const chatId = action.payload.chat;

      const index = state.items.findIndex((c) => c._id === chatId);

      if (index !== -1) {
        state.items[index].lastMessage = action.payload;
      }
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchMyChats.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchMyChats.fulfilled, (state, action) => {
        state.loading = false;

        state.items = action.payload;
      })

      .addCase(fetchMyChats.rejected, (state, action) => {
        state.loading = false;

        state.error = action.error.message || "Failed";
      })

      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.activeChat = action.payload;
      })

      // Admin: all chats
      .addCase(fetchAllChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllChats.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch all chats";
      })

      // Chats by worker
      .addCase(fetchChatsByWorker.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatsByWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchChatsByWorker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch worker chats";
      })

      // Chats by client
      .addCase(fetchChatsByClient.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatsByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchChatsByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch client chats";
      });
  },
});

export const {
  setActiveChat,

  updateLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
