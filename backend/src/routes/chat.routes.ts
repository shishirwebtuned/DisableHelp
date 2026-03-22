import express from "express";
import {
  createChat,
  getActiveChats,
  getAllChats,
  getChatById,
  getChatsByClientId,
  getChatsByWorkerId,
  getMyChats,
  updateChatStatus,
} from "../controllers/chat.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

export const initChatRoutes = (io: any) => {
  router.post("/", protect, createChat);

  router.get("/", protect, adminOnly, getAllChats);

  router.patch("/status/:chatId", protect, updateChatStatus(io));

  router.get("/active", protect, getActiveChats);

  router.get("/my-chats", protect, getMyChats);

  router.get("/worker/:workerId", protect, getChatsByWorkerId);

  router.get("/client/:clientId", protect, getChatsByClientId);

  router.get("/:chatId", protect, getChatById);

  return router;
};

export default router;
