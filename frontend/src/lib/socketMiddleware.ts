// store/socketMiddleware.ts
import { Middleware } from "@reduxjs/toolkit";
import { getSocket } from "@/lib/socket";
import {
  addMessage,
  markMessagesRead,
  markReadLocal,
  removeMessage,
  updateMessage,
} from "@/redux/slices/messageSlice";
import { updateLastMessage } from "@/redux/slices/chatSlice";
import { addNotification } from "@/redux/slices/notificationSlice";
import { AppDispatch, RootState } from "@/redux/store";

export const socketMiddleware: Middleware = (store) => {
  let listenersRegistered = false;

  const registerListeners = () => {
    if (listenersRegistered) return;
    listenersRegistered = true;

    const socket = getSocket();

    socket.on("newMessage", (message) => {
      console.log("🔥 newMessage received:", message);

      const state = store.getState() as RootState;
      const exists = state.message.items.find(
        (m: any) => m._id === message._id,
      );

      if (!exists) {
        store.dispatch(addMessage(message));
      }

      store.dispatch(
        updateLastMessage({
          chatId: message.chat?._id || message.chat,
          lastMessage: message,
        }),
      );

      const activeChatId = state.chat.activeChat?._id;
      const incomingChatId =
        message.chat?._id?.toString() ?? message.chat?.toString();

      if (activeChatId && incomingChatId === activeChatId) {
        (store.dispatch as AppDispatch)(markMessagesRead(activeChatId));
      }
    });

    socket.on("messageEdited", (message) => {
      store.dispatch(updateMessage(message));
    });

    socket.on("messageDeleted", (messageId: string) => {
      store.dispatch(removeMessage(messageId));
    });

    socket.on("messagesRead", ({ chatId }: { chatId: string }) => {
      const state = store.getState() as any;
      const activeChatId = state.chat.activeChat?._id;
      if (chatId === activeChatId) {
        store.dispatch(markReadLocal());
      }
    });

    socket.on("newNotification", (notification) => {
      console.log("🔔 newNotification received:", notification);
      store.dispatch(addNotification(notification));
    });

    // Re-register on reconnect
    socket.on("connect", () => {
      listenersRegistered = false;
      registerListeners();
    });
  };

  registerListeners();

  return (next) => (action) => next(action);
};
