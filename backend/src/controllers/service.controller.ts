import mongoose from "mongoose";
import { Service } from "../models/service.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";

export const createService = catchAsync(async (req, res) => {
  const { name, code, categories } = req.body;

  if (!name || !code) throw new AppError("Name and code are required", 400);

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new AppError("Categories must be a non-empty array", 400);
  }

  const service = await Service.findOne({ $or: [{ name }, { code }] });

  if (service) throw new AppError("Service name or code already in use", 400);

  const newService = new Service({
    name,
    code,
    categories,
  });

  await newService.save();

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Service Create Successfully.",
    data: newService,
  });
});

export const updateService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;

  const { name, code, status, categories } = req.body;

  if (!mongoose.Types.ObjectId.isValid(serviceId as string)) {
    throw new AppError("Invalid service ID", 400);
  }

  const service = await Service.findById(serviceId);

  if (!service) throw new AppError("Service not found", 400);

  if (!name && !code && !categories) {
    throw new AppError("Nothing to update", 400);
  }

  if (categories && (!Array.isArray(categories) || categories.length === 0)) {
    throw new AppError("Categories must be a non-empty array", 400);
  }

  if (name || code) {
    const existingService = await Service.findOne({
      _id: { $ne: serviceId },
      $or: [{ name }, { code }],
    });
    if (existingService)
      throw new AppError("Service name or code already in use", 400);
  }

  if (name) service.name = name;
  if (code) service.code = code;
  if (categories) service.categories = categories;
  if (status !== undefined) service.status = status;

  await service.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service updated successfully",
    data: service,
  });
});

export const deleteService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(serviceId as string)) {
    throw new AppError("Invalid service ID", 400);
  }

  const service = await Service.findByIdAndDelete(serviceId);

  if (!service) throw new AppError("Service not found", 400);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service deleted successfully",
  });
});

export const getAllServices = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, ["name", "status", "code"]);

  const services = await Service.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!services || services.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Service Found",
      data: [],
    });
  }

  const total = await Service.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Services fetched successfully",
    data: {
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getServiceById = catchAsync(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);

  if (!service) throw new AppError("Service not found", 400);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service fetched successfully",
    data: service,
  });
});
