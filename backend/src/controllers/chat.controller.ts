import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

export const createChat = catchAsync(async (req, res) => {
  const { agreementId, clientId, workerId, status } = req.body;

  if (!agreementId || !clientId || !workerId) {
    throw new AppError("agreementId, clientId, and workerId are required", 400);
  }

  let chat = await Chat.findOne({ agreement: agreementId });

  if (chat) {
    throw new AppError("Chat for this agreement already exists", 400);
  }

  chat = await Chat.create({
    agreement: agreementId,
    client: clientId,
    worker: workerId,
    status: status || "pending",
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Chat created successfully",
    data: chat,
  });
});

export const getAllChats = catchAsync(async (req, res) => {
  const chats = await Chat.find()
    .populate("agreement")
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .populate("lastMessage");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chats fetched successfully",
    data: chats,
  });
});

export const getChatById = catchAsync(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId)
    .populate("agreement")
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .populate("lastMessage");

  if (!chat) throw new AppError("Chat not found", 404);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chat fetched successfully",
    data: chat,
  });
});

export const getMyChats = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  const query: any = {};
  if (userRole === "worker") {
    query.worker = userId;
  } else if (userRole === "client") {
    query.client = userId;
  } else {
    throw new AppError("Invalid user role for fetching chats", 403);
  }

  const chats = await Chat.find(query)
    .populate("agreement")
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .populate("lastMessage");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chats fetched successfully",
    data: chats,
  });
});

export const getChatsByWorkerId = catchAsync(async (req, res) => {
  let { workerId } = req.params;

  if (!workerId) throw new AppError("Worker ID is required", 400);
  if (Array.isArray(workerId)) workerId = workerId[0];

  const chats = await Chat.find({
    worker: new mongoose.Types.ObjectId(workerId),
  })
    .populate("agreement")
    .populate("client", "firstName lastName email")
    .populate("lastMessage");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chats fetched successfully for worker",
    data: chats,
  });
});

export const getChatsByClientId = catchAsync(async (req, res) => {
  let { clientId } = req.params;

  if (!clientId) throw new AppError("Client ID is required", 400);
  if (Array.isArray(clientId)) clientId = clientId[0];

  const chats = await Chat.find({
    client: new mongoose.Types.ObjectId(clientId),
  })
    .populate("agreement")
    .populate("worker", "firstName lastName email")
    .populate("lastMessage");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chats fetched successfully for client",
    data: chats,
  });
});

export const updateChatStatus = (io: any) =>
  catchAsync(async (req, res) => {
    const { chatId } = req.params;
    const { status } = req.body;

    if (!["pending", "active", "suspended"].includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    const chat = await Chat.findById(chatId);
    if (!chat) throw new AppError("Chat not found", 404);

    chat.status = status;
    await chat.save();

    io.to(chatId).emit("chatUpdated", chat);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Chat status updated successfully",
      data: chat,
    });
  });

export const getActiveChats = catchAsync(async (req, res) => {
  const chats = await Chat.find({ status: "active" })
    .populate("agreement")
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .populate("lastMessage");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Active chats fetched successfully",
    data: chats,
  });
});
