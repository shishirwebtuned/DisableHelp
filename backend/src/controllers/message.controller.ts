import mongoose from "mongoose";
import { Chat, type ChatDocument } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";
import { sendResponse } from "../utils/sendResponse.js";
import { Notification } from "../models/notification.model.js";

export const sendMessage = (io: any) =>
  catchAsync(async (req, res) => {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const actionUrl = userRole === "client" ? "/worker/inbox" : "/client/inbox";

    if (!message || !message.trim()) {
      throw new AppError("Message cannot be empty", 400);
    }

    const chat = await Chat.findById(chatId).populate("agreement");
    if (!chat) throw new AppError("Chat not found", 404);

    if (![chat.client.toString(), chat.worker.toString()].includes(userId)) {
      throw new AppError(
        "You are not authorized to send messages in this chat",
        403,
      );
    }

    if (chat.status !== "active") {
      throw new AppError("Cannot send messages. Agreement is not active.", 400);
    }

    const newMessage = await Message.create({
      chat: chat._id,
      sender: userId,
      message: message.trim(),
    });

    chat.lastMessage = newMessage._id;
    await chat.save();

    const populatedMessage = await newMessage.populate(
      "sender",
      "firstName lastName email",
    );

    console.log("Emitting newMessage to room:", chatId);
    console.log("Message chat field:", populatedMessage.chat);
    io.to(chatId).emit("newMessage", populatedMessage.toObject());

    const recipientId =
      chat.client.toString() === userId ? chat.worker : chat.client;

    const sender = populatedMessage.sender as any;
    const senderName = `${sender.firstName} ${sender.lastName}`;

    const notification = await Notification.create({
      recipient: recipientId,
      sender: userId,
      type: "message",
      title: "New Message",
      actionUrl: actionUrl,
      message: `${senderName} sent you a message`,
    });

    const populatedNotification = await notification.populate(
      "sender",
      "firstName lastName avatar",
    );

    // Emit notification to recipient's personal room
    io.to(`user:${recipientId}`).emit(
      "newNotification",
      populatedNotification.toObject(),
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  });

export const editMessage = (io: any) =>
  catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      throw new AppError("Message cannot be empty", 400);
    }

    const msg = await Message.findById(messageId).populate<{
      chat: ChatDocument;
    }>("chat");

    if (!msg) throw new AppError("Message not found", 404);

    // Only sender can edit
    if (msg.sender.toString() !== userId) {
      throw new AppError("You are not authorized to edit this message", 403);
    }

    // Check chat status
    if (msg.chat.status !== "active") {
      throw new AppError("Cannot edit message. Chat is not active.", 400);
    }

    msg.message = message.trim();
    msg.editedAt = new Date();

    await msg.save();

    io.to(msg.chat._id.toString()).emit("editMessage", msg);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Message edited successfully",
      data: msg,
    });
  });

export const deleteMessage = (io: any) =>
  catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    const msg = await Message.findById(messageId).populate<{
      chat: ChatDocument;
    }>("chat");
    if (!msg) throw new AppError("Message not found", 404);

    // Only sender can delete
    if (msg.sender.toString() !== userId) {
      throw new AppError("You are not authorized to delete this message", 403);
    }

    // Check chat status
    if (msg.chat.status !== "active") {
      throw new AppError("Cannot delete message. Chat is not active.", 400);
    }

    await msg.deleteOne();

    io.to(msg.chat._id.toString()).emit("deleteMessage", { messageId });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Message deleted successfully",
    });
  });

export const getMessagesByChatId = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  const { page, limit, skip } = getPagination(req.query);

  const chat = await Chat.findById(chatId);

  if (!chat) throw new AppError("Chat not found", 404);

  const isAdmin = req.user.role === "admin";
  const isParticipant = [
    chat.client.toString(),
    chat.worker.toString(),
  ].includes(userId);

  if (!isAdmin && !isParticipant) {
    throw new AppError("Not authorized", 403);
  }

  const filter = buildFilter(req.query, {
    boolean: ["read"],
    exact: ["sender"],
    searchFields: ["message"],
  });

  filter.chat = chatId;

  const messages = await Message.find(filter)
    .populate("sender", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!messages || messages.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Messages Found",
      data: [],
    });
  }

  const total = await Message.countDocuments(filter);

  if (isParticipant) {
    await Message.updateMany(
      {
        chat: new mongoose.Types.ObjectId(chatId as string),
        sender: { $ne: new mongoose.Types.ObjectId(userId as string) },
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
    );
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Messages fetched successfully",
    data: {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getMessageById = catchAsync(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findById(messageId)
    .populate("sender", "firstName lastName email")
    .populate<{ chat: ChatDocument }>("chat");

  if (!message) throw new AppError("Message not found", 404);

  if (
    ![message.chat.client.toString(), message.chat.worker.toString()].includes(
      userId,
    )
  ) {
    throw new AppError("Not authorized", 403);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Message fetched",
    data: message,
  });
});

export const markMessagesAsRead = (io: any) =>
  catchAsync(async (req, res) => {
    const chatId = req.params.chatId as string;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);

    if (!chat) throw new AppError("Chat not found", 404);

    if (![chat.client.toString(), chat.worker.toString()].includes(userId)) {
      throw new AppError("Not authorized", 403);
    }

    const hasMessagesToRead = await Message.exists({
      chat: new mongoose.Types.ObjectId(chatId),
      sender: { $ne: new mongoose.Types.ObjectId(userId) },
      read: false,
    });

    if (!hasMessagesToRead) {
      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "No unread messages to mark",
      });
    }

    const result = await Message.updateMany(
      {
        chat: new mongoose.Types.ObjectId(chatId),
        sender: { $ne: new mongoose.Types.ObjectId(userId) },
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
    );

    if (result.modifiedCount === 0) {
      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "No unread messages to mark",
      });
    }

    io.to(chatId).emit("messagesRead", { chatId, userId });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `${result.modifiedCount} messages marked as read`,
    });
  });

export const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const chats = await Chat.find({
    $or: [{ client: userId }, { worker: userId }],
  });

  const chatIds = chats.map((c) => c._id);

  const count = await Message.countDocuments({
    chat: { $in: chatIds },
    sender: { $ne: userId },
    read: false,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Unread count fetched",
    data: { count },
  });
});
