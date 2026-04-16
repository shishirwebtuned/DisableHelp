import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadCount,
  sendNotificationByAdmin,
} from "../controllers/notification.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

export const initNotificationRoutes = (io: any) => {
  router.get("/", protect, getMyNotifications);
  router.get("/unread-count", protect, getUnreadCount);
  router.patch("/mark-all-read", protect, markAllNotificationsRead);
  router.post("/admin/send", protect, adminOnly, sendNotificationByAdmin(io));
  router.patch("/:notificationId/read", protect, markNotificationRead);
  router.delete("/:notificationId", protect, deleteNotification);

  return router;
};

export default router;
