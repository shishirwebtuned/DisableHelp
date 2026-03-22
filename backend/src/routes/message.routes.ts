import express from "express";
import {
  deleteMessage,
  editMessage,
  getMessageById,
  getMessagesByChatId,
  markMessagesAsRead,
  getUnreadCount,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { sendMessage as sendMessageController } from "../controllers/message.controller.js";

const router = express.Router();

export const initMessageRoutes = (io: any) => {
  router.post("/:chatId", protect, sendMessageController(io));

  router.patch("/:messageId", protect, editMessage(io));

  router.delete("/:messageId", protect, deleteMessage(io));

  router.get("/chat/:chatId", protect, getMessagesByChatId);

  router.get("/unread-count", protect, getUnreadCount);

  router.get("/:messageId", protect, getMessageById);

  router.patch("/mark-read/:chatId", protect, markMessagesAsRead(io));

  return router;
};

export default router;
