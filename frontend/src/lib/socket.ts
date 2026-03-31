// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let activeChatId: string | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
};

export const setActiveSocketChat = (chatId: string | null) => {
  activeChatId = chatId;
};

export const connectSocket = (token: string, userId: string) => {
  const s = getSocket();
  s.auth = { token };

  s.off("connect");
  s.off("disconnect");
  s.off("connect_error");

  s.on("connect", () => {
    console.log("✅ Socket connected:", s.id);

    s.emit("joinUserRoom", userId);
    console.log("📡 Joined user room:", userId);

    if (activeChatId) {
      s.emit("joinChat", activeChatId);
      console.log("📡 Rejoined chat room:", activeChatId);
    }
  });

  s.on("disconnect", () => console.log("❌ Socket disconnected"));
  s.on("connect_error", (err) => console.log("❌ Socket error:", err.message));

  if (!s.connected) {
    s.connect();
  } else {
    s.emit("joinUserRoom", userId);
    if (activeChatId) {
      s.emit("joinChat", activeChatId);
    }
    console.log("📡 Already connected, joined user room:", userId);
  }

  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
