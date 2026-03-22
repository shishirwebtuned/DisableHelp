import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  chat: string;
  sender: string;
  message: string;
  read?: boolean;
  editedAt?: string;
  createdAt: string;
}

interface UseChatSocketProps {
  chatId: string;
  userId: string;
}

export const useChatSocket = ({ chatId, userId }: UseChatSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const socket = io("http://localhost:5000"); // replace with your backend URL
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
      socket.emit("joinChat", chatId);
    });

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [msg, ...prev]);
    });

    socket.on("editMessage", (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    });

    socket.on("deleteMessage", ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    socket.on("messagesRead", (data: { chatId: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.sender !== userId ? { ...m, read: true } : m)),
      );
    });

    return () => {
      socket.emit("leaveChat", chatId);
      socket.disconnect();
    };
  }, [chatId, userId]);

  // Send a message
  const sendMessage = useCallback(
    (messageText: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("sendMessage", {
        chatId,
        message: messageText,
        sender: userId,
      });
    },
    [chatId, userId],
  );

  return { messages, sendMessage, setMessages, socket: socketRef.current };
};
