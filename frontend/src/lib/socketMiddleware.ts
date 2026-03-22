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

export const socketMiddleware: Middleware = (store) => {
  let listening = false;

  return (next) => (action) => {
    const result = next(action);
    const socket = getSocket();

    if (!listening && socket) {
      listening = true;

      // New message received
      socket.on("newMessage", (message) => {
        console.log("🔥 newMessage received:", message);

        store.dispatch(addMessage(message));
        store.dispatch(updateLastMessage(message));

        const state = store.getState() as any;
        const activeChatId = state.chat.activeChat?._id;
        const incomingChatId =
          message.chat?._id?.toString() ?? message.chat?.toString();

        console.log("activeChatId:", activeChatId);
        console.log("incomingChatId:", incomingChatId);

        if (activeChatId && incomingChatId === activeChatId) {
          (store.dispatch as any)(markMessagesRead(activeChatId));
        }
      });

      // Message edited
      socket.on("messageEdited", (message) => {
        store.dispatch(updateMessage(message));
      });

      // Message deleted
      socket.on("messageDeleted", (messageId: string) => {
        store.dispatch(removeMessage(messageId));
      });

      // Other user marked messages as read
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
    }

    return result;
  };
};
