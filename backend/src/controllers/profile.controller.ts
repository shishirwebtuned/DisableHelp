import multer from "multer";
import streamifier from "streamifier";
import { WorkerProfile } from "../models/workerProfile.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import cloudinary from "../utils/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const storage = multer.memoryStorage();

export const upload = multer({ storage }).fields([
  { name: "avatar", maxCount: 1 },
  { name: "cprFile", maxCount: 1 },
  { name: "driverLicenseFile", maxCount: 1 },
  { name: "firstAidFile", maxCount: 1 },
  { name: "wwccFile", maxCount: 1 },
]);

export const createWorkerProfile = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const existingProfile = await WorkerProfile.findOne({ user: userId });
  if (existingProfile) {
    throw new AppError("Worker profile already exists", 400);
  }

  const {
    gender,
    services,
    rates,
    freeMeetAndGreet,
    availability,
    locations,
    experienceSummary,
    bankDetails,
    workHistory,
    educationAndTraining,
    ndisWorkerScreening,
    lgbtqiaPlusFriendly,
    immunisation,
    languages,
    culturalBackground,
    religion,
    interests,
    aboutMe,
    preferences,
    personalDetails,
  } = req.body;

  const files = req.files as Record<string, Express.Multer.File[]>;

  const personalDetailsData: any = {
    bio: personalDetails?.bio,
  };

  /* ---------- Avatar ---------- */
  if (files?.avatar?.[0]) {
    const avatar = await uploadToCloudinary(
      files.avatar[0].buffer,
      "DisableHelp/supportWorker/avatar",
    );

    personalDetailsData.avatar = {
      url: avatar.url,
      public_id: avatar.public_id,
    };
  }

  /* ---------- Additional Training ---------- */
  personalDetailsData.additionalTraining = {};

  if (files?.cprFile?.[0]) {
    const cpr = await uploadToCloudinary(
      files.cprFile[0].buffer,
      "DisableHelp/supportWorker/cpr",
    );

    personalDetailsData.additionalTraining.cpr = {
      expiryDate: personalDetails?.additionalTraining?.cpr?.expiryDate,
      file: {
        url: cpr.url,
        public_id: cpr.public_id,
      },
      isVerified: false,
    };
  }

  if (files?.driverLicenseFile?.[0]) {
    const license = await uploadToCloudinary(
      files.driverLicenseFile[0].buffer,
      "DisableHelp/supportWorker/driverLicense",
    );

    personalDetailsData.additionalTraining.driverLicense = {
      expiryDate:
        personalDetails?.additionalTraining?.driverLicense?.expiryDate,
      file: {
        url: license.url,
        public_id: license.public_id,
      },
      isVerified: false,
    };
  }

  if (files?.firstAidFile?.[0]) {
    const firstAid = await uploadToCloudinary(
      files.firstAidFile[0].buffer,
      "DisableHelp/supportWorker/firstAid",
    );

    personalDetailsData.additionalTraining.firstAid = {
      expiryDate: personalDetails?.additionalTraining?.firstAid?.expiryDate,
      file: {
        url: firstAid.url,
        public_id: firstAid.public_id,
      },
      isVerified: false,
    };
  }

  /* ---------- WWCC ---------- */
  if (files?.wwccFile?.[0]) {
    const wwcc = await uploadToCloudinary(
      files.wwccFile[0].buffer,
      "DisableHelp/supportWorker/wwcc",
    );

    personalDetailsData.wwcc = {
      wwccNumber: personalDetails?.wwcc?.wwccNumber,
      expiryDate: personalDetails?.wwcc?.expiryDate,
      file: {
        url: wwcc.url,
        public_id: wwcc.public_id,
      },
      isVerified: false,
    };
  }

  const newProfile = await WorkerProfile.create({
    user: userId,
    gender,
    services,
    rates,
    freeMeetAndGreet,
    availability,
    locations,
    experienceSummary,
    bankDetails,
    workHistory,
    educationAndTraining,
    ndisWorkerScreening,
    lgbtqiaPlusFriendly,
    immunisation,
    languages,
    culturalBackground,
    religion,
    interests,
    aboutMe,
    preferences,
    personalDetails: personalDetailsData,
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Worker profile created successfully",
    data: newProfile,
  });
});

export const updateWorkerProfile = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const profileData = req.body;

  const updatedProfile = await WorkerProfile.findOneAndUpdate(
    { user: userId },
    profileData,
    { new: true, runValidators: true },
  );

  if (!updatedProfile) {
    throw new AppError("Worker profile not found", 404);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Worker profile updated successfully",
    data: updatedProfile,
  });
});
