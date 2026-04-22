// controllers/notification.controller.ts
import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { getPagination } from "../utils/queryHelper.js";
import { sendResponse } from "../utils/sendResponse.js";

export const getMyNotifications = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const userId = req.user._id;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: userId }),
  ]);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notifications retrieved successfully",
    data: {
      notifications,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
});

export const markNotificationRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Invalid notificationId");
  }

  const _id = new mongoose.Types.ObjectId(notificationId);

  const notification = await Notification.findOneAndUpdate(
    { _id: _id, recipient: userId },
    { read: true, readAt: new Date() },
    { new: true },
  );

  if (!notification) throw new AppError("Notification not found", 404);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notification marked as read",
    data: { notification },
  });
});

export const markAllNotificationsRead = catchAsync(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() },
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All notifications marked as read",
    data: null,
  });
});

export const deleteNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Invalid notificationId");
  }

  const _id = new mongoose.Types.ObjectId(notificationId);
  const notification = await Notification.findOneAndDelete({
    _id: _id,
    recipient: userId,
  });

  if (!notification) throw new AppError("Notification not found", 404);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notification deleted",
    data: null,
  });
});

export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Unread count retrieved",
    data: { count },
  });
});

export const sendNotificationByAdmin = (io: any) =>
  catchAsync(async (req, res) => {
    const { recipientId, title, message } = req.body;
    const senderId = req.user._id;

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: "system",
      title,
      message,
    });

    io.to(`user:${recipientId}`).emit("newNotification", notification);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Message sent Successfully.",
      data: { notification },
    });
  });
