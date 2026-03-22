// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

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
  });
  s.on("disconnect", () => console.log("❌ Socket disconnected"));
  s.on("connect_error", (err) => console.log("❌ Socket error:", err.message));

  if (!s.connected) {
    s.connect();
  } else {
    // Already connected — join room immediately
    s.emit("joinUserRoom", userId);
    console.log("📡 Already connected, joined user room:", userId);
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
