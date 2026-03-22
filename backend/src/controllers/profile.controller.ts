import multer from "multer";
import streamifier from "streamifier";
import { WorkerProfile } from "../models/workerProfile.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import cloudinary from "../utils/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { setNestedValue } from "../utils/setNestedValue.js";
import mongoose from "mongoose";
import {
  ClientProfile,
  type IClientProfile,
} from "../models/clientProfile.model.js";
import type { IWorkerProfile } from "../types/type.js";

const storage = multer.memoryStorage();

export const upload = multer({ storage }).fields([
  { name: "avatar", maxCount: 1 },
  { name: "cprFile", maxCount: 1 },
  { name: "driverLicenseFile", maxCount: 1 },
  { name: "firstAidFile", maxCount: 1 },
  { name: "wwccFile", maxCount: 1 },
  { name: "additionalDocuments", maxCount: 10 },
]);

export const createWorkerProfile = catchAsync(async (req, res) => {
  const userId = req.user!.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id", 400);
  }

  const existingProfile = await WorkerProfile.exists({
    user: new mongoose.Types.ObjectId(userId),
  });
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

  personalDetailsData.additionalDocuments = [];

  if (files?.additionalDocuments) {
    const docs = files.additionalDocuments;

    for (const [i, file] of docs.entries()) {
      if (!file) continue;
      const uploaded = await uploadToCloudinary(
        file.buffer,
        "DisableHelp/supportWorker/additionalDocs",
      );

      personalDetailsData.additionalDocuments.push({
        name: personalDetails?.additionalDocuments?.[i]?.name,
        expiryDate: personalDetails?.additionalDocuments?.[i]?.expiryDate,

        file: {
          url: uploaded.url,
          public_id: uploaded.public_id,
        },

        isVerified: false,
      });
    }
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

// export const updateWorkerProfile = catchAsync(async (req, res) => {
//   const userId = req.user!.id;

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     throw new AppError("Invalid user id", 400);
//   }

//   const profile = await WorkerProfile.findOne({ user: userId });

//   if (!profile) {
//     throw new AppError("Worker profile not found", 400);
//   }

//   const { body, files } = req;

//   const updatedData: any = { ...body };

//   const personalDetailsData: any = { ...(profile.personalDetails || {}) };

//     let parsedPersonalDetails = body.personalDetails;
//   if (typeof body.personalDetails === "string") {
//     parsedPersonalDetails = JSON.parse(body.personalDetails);
//   }

//   if (body.personalDetails) {
//     if (body.personalDetails.bio !== undefined) {
//       personalDetailsData.bio = body.personalDetails.bio;
//     }

//     if (body.personalDetails.wwcc) {
//       personalDetailsData.wwcc = personalDetailsData.wwcc || {
//         wwccNumber: "",
//         expiryDate: new Date(),
//         isVerified: false,
//       };
//       if (body.personalDetails.wwcc.wwccNumber !== undefined) {
//         personalDetailsData.wwcc.wwccNumber =
//           body.personalDetails.wwcc.wwccNumber;
//       }
//       if (body.personalDetails.wwcc.expiryDate !== undefined) {
//         personalDetailsData.wwcc.expiryDate =
//           body.personalDetails.wwcc.expiryDate;
//       }
//     }
//   }

//   const fileMap: Record<string, string[]> = {
//     avatar: ["avatar"],
//     cprFile: ["additionalTraining", "cpr", "file"],
//     driverLicenseFile: ["additionalTraining", "driverLicense", "file"],
//     firstAidFile: ["additionalTraining", "firstAid", "file"],
//     wwccFile: ["wwcc", "file"],
//   };

//   const filesMap = files as Record<string, Express.Multer.File[]>;

//   for (const [fieldName, path] of Object.entries(fileMap)) {
//     const fileArray = filesMap?.[fieldName];
//     if (!fileArray?.[0]) continue;

//     let parentObj: Record<string, any> = personalDetailsData;

//     for (let i = 0; i < path.length - 1; i++) {
//       const key = path[i] as string;
//       if (!parentObj[key]) parentObj[key] = {};
//       parentObj = parentObj[key];
//     }

//     const lastKey = path[path.length - 1] as string;

//     const oldFile = parentObj[lastKey];

//     if (oldFile?.public_id) {
//       try {
//         await cloudinary.uploader.destroy(oldFile.public_id);
//       } catch (err) {
//         console.warn(`Failed to delete old file ${oldFile.public_id}`, err);
//       }
//     }

//     const uploadResult = await uploadToCloudinary(
//       fileArray[0].buffer,
//       `DisableHelp/supportWorker/${fieldName.replace("File", "")}`,
//     );

//     parentObj[lastKey] = {
//       url: uploadResult.url,
//       public_id: uploadResult.public_id,
//     };

//     if (fieldName !== "avatar") {
//       parentObj.isVerified = false;

//       const trainingKey = fieldName.replace("File", "");

//       const expiry =
//         body.personalDetails?.additionalTraining?.[trainingKey]?.expiryDate;

//       if (expiry) {
//         parentObj.expiryDate = expiry;
//       }

//       if (fieldName === "wwccFile") {
//         if (body.personalDetails?.wwcc?.expiryDate) {
//           parentObj.expiryDate = body.personalDetails.wwcc.expiryDate;
//         }

//         if (body.personalDetails?.wwcc?.wwccNumber) {
//           parentObj.wwccNumber = body.personalDetails.wwcc.wwccNumber;
//         }
//       }
//     }
//   }

//   let parsedPersonalDetails = body.personalDetails;

//   if (typeof body.personalDetails === "string") {
//     parsedPersonalDetails = JSON.parse(body.personalDetails);
//   }

//   if (filesMap?.additionalDocuments) {
//     const existingDocs = personalDetailsData.additionalDocuments || [];

//     for (const [i, file] of filesMap.additionalDocuments.entries()) {
//       const uploaded = await uploadToCloudinary(
//         file.buffer,
//         "DisableHelp/supportWorker/additionalDocs",
//       );

//       existingDocs.push({
//         name:
//           parsedPersonalDetails?.additionalDocuments?.[i]?.name ||
//           file.originalname,

//         expiryDate: parsedPersonalDetails?.additionalDocuments?.[i]?.expiryDate,

//         file: {
//           url: uploaded.url,
//           public_id: uploaded.public_id,
//         },

//         isVerified: false,
//       });
//     }

//     personalDetailsData.additionalDocuments = existingDocs;
//   }

//   updatedData.personalDetails = personalDetailsData;

//   const updatedProfile = await WorkerProfile.findByIdAndUpdate(
//     profile._id,
//     updatedData,
//     { new: true },
//   );

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Worker profile updated successfully",
//     data: updatedProfile,
//   });
// });

export const updateWorkerProfile = catchAsync(async (req, res) => {
  const userId = req.user!.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id", 400);
  }

  const profile = await WorkerProfile.findOne({ user: userId });

  if (!profile) {
    throw new AppError("Worker profile not found", 400);
  }

  const { body, files } = req;
  const updatedData: any = { ...body };
  const personalDetailsData: any = { ...(profile.personalDetails || {}) };

  // Parse personalDetails if sent as string
  let parsedPersonalDetails = body.personalDetails;
  if (typeof body.personalDetails === "string") {
    parsedPersonalDetails = JSON.parse(body.personalDetails);
  }

  // Update bio
  if (parsedPersonalDetails?.bio !== undefined) {
    personalDetailsData.bio = parsedPersonalDetails.bio;
  }

  // Update WWCC
  if (parsedPersonalDetails?.wwcc) {
    personalDetailsData.wwcc = personalDetailsData.wwcc || {
      wwccNumber: "",
      expiryDate: new Date(),
      isVerified: false,
    };

    if (parsedPersonalDetails.wwcc.wwccNumber !== undefined) {
      personalDetailsData.wwcc.wwccNumber =
        parsedPersonalDetails.wwcc.wwccNumber;
    }
    if (parsedPersonalDetails.wwcc.expiryDate !== undefined) {
      personalDetailsData.wwcc.expiryDate =
        parsedPersonalDetails.wwcc.expiryDate;
    }
  }

  // Map of file fields for main categories
  const fileMap: Record<string, string[]> = {
    avatar: ["avatar"],
    cprFile: ["additionalTraining", "cpr", "file"],
    driverLicenseFile: ["additionalTraining", "driverLicense", "file"],
    firstAidFile: ["additionalTraining", "firstAid", "file"],
    wwccFile: ["wwcc", "file"],
  };

  const filesMap = files as Record<string, Express.Multer.File[]>;

  // Handle main files (avatar, CPR, license, first aid, WWCC)
  for (const [fieldName, path] of Object.entries(fileMap)) {
    const fileArray = filesMap?.[fieldName];
    if (!fileArray?.[0]) continue;

    let parentObj: Record<string, any> = personalDetailsData;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i] as string;
      if (!parentObj[key]) parentObj[key] = {};
      parentObj = parentObj[key];
    }

    const lastKey = path[path.length - 1] as string;
    const oldFile = parentObj[lastKey];

    if (oldFile?.public_id) {
      try {
        await cloudinary.uploader.destroy(oldFile.public_id);
      } catch (err) {
        console.warn(`Failed to delete old file ${oldFile.public_id}`, err);
      }
    }

    const uploadResult = await uploadToCloudinary(
      fileArray[0].buffer,
      `DisableHelp/supportWorker/${fieldName.replace("File", "")}`,
    );

    parentObj[lastKey] = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    };

    if (fieldName !== "avatar") {
      parentObj.isVerified = false;

      const trainingKey = fieldName.replace("File", "");
      const expiry =
        parsedPersonalDetails?.additionalTraining?.[trainingKey]?.expiryDate;

      if (expiry) {
        parentObj.expiryDate = expiry;
      }

      if (fieldName === "wwccFile") {
        if (parsedPersonalDetails?.wwcc?.expiryDate) {
          parentObj.expiryDate = parsedPersonalDetails.wwcc.expiryDate;
        }
        if (parsedPersonalDetails?.wwcc?.wwccNumber) {
          parentObj.wwccNumber = parsedPersonalDetails.wwcc.wwccNumber;
        }
      }
    }
  }

  // Handle additionalDocuments
  if (filesMap?.additionalDocuments) {
    const existingDocs = personalDetailsData.additionalDocuments || [];

    for (const [i, file] of filesMap.additionalDocuments.entries()) {
      const uploaded = await uploadToCloudinary(
        file.buffer,
        "DisableHelp/supportWorker/additionalDocs",
      );

      const docIndex = parsedPersonalDetails?.additionalDocuments?.[i]?.index;

      const newDoc = {
        name:
          parsedPersonalDetails?.additionalDocuments?.[i]?.name ||
          file.originalname,
        expiryDate: parsedPersonalDetails?.additionalDocuments?.[i]?.expiryDate,
        file: {
          url: uploaded.url,
          public_id: uploaded.public_id,
        },
        isVerified: false,
      };

      if (docIndex !== undefined && existingDocs[docIndex]) {
        // Replace existing document
        existingDocs[docIndex] = {
          ...existingDocs[docIndex],
          ...newDoc,
        };
      } else {
        // Add new document
        existingDocs.push(newDoc);
      }
    }

    personalDetailsData.additionalDocuments = existingDocs;
  }

  updatedData.personalDetails = personalDetailsData;

  const updatedProfile = await WorkerProfile.findByIdAndUpdate(
    profile._id,
    updatedData,
    { new: true },
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Worker profile updated successfully",
    data: updatedProfile,
  });
});

export const deleteWorkerFile = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const { fileType, index } = req.body;

  if (!fileType) {
    throw new AppError("fileType is required", 400);
  }

  const profile = await WorkerProfile.findOne({ user: userId });

  if (!profile) {
    throw new AppError("Worker profile not found", 404);
  }

  const personalDetails = profile.personalDetails || {};

  if (fileType === "additionalDocuments") {
    const docIndex = Number(index);
    if (isNaN(docIndex)) {
      throw new AppError("Valid document index required", 400);
    }

    const docs = personalDetails.additionalDocuments || [];
    if (!docs[docIndex]) {
      throw new AppError("Document not found", 404);
    }

    const doc = docs[docIndex];

    if (doc.file?.public_id) {
      try {
        await cloudinary.uploader.destroy(doc.file.public_id);
      } catch (err) {
        console.warn("Failed to delete additional document:", err);
      }
    }

    // Remove document from array
    docs.splice(docIndex, 1);
    personalDetails.additionalDocuments = docs;

    profile.personalDetails = personalDetails;
    const updatedProfile = await profile.save();

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Document deleted successfully",
      data: updatedProfile,
    });
  }

  const fileMap: Record<string, string[]> = {
    avatar: ["avatar"],
    cprFile: ["additionalTraining", "cpr", "file"],
    driverLicenseFile: ["additionalTraining", "driverLicense", "file"],
    firstAidFile: ["additionalTraining", "firstAid", "file"],
    wwccFile: ["wwcc", "file"],
  };

  const path = fileMap[fileType];

  if (!path) {
    throw new AppError("Invalid fileType", 400);
  }

  let currentObj: Record<string, any> = personalDetails;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (key && !currentObj[key]) currentObj[key] = {};
    if (key) currentObj = currentObj[key] as Record<string, any>;
  }
  const lastKey = path[path.length - 1];

  if (!lastKey) {
    throw new AppError("Invalid file path", 400);
  }

  const fileData = currentObj[lastKey];

  if (!fileData?.public_id) {
    throw new AppError("File not found", 404);
  }

  try {
    await cloudinary.uploader.destroy(fileData.public_id);
  } catch (err) {
    console.warn(`Failed to delete file ${fileData.public_id}:`, err);
  }

  // Remove the file reference and reset isVerified if applicable
  if (fileType === "avatar") {
    currentObj[lastKey] = {};
  } else {
    currentObj[lastKey] = { isVerified: false };
  }

  profile.personalDetails = personalDetails;
  const updatedProfile = await profile.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "File deleted successfully",
    data: updatedProfile,
  });
});

export const createClientProfile = catchAsync(async (req, res) => {
  const userId = req.user!.id;

  const existingProfile = await ClientProfile.exists({
    user: new mongoose.Types.ObjectId(userId),
  });

  if (existingProfile) {
    throw new AppError("Client profile already exists", 400);
  }

  // const { data } = req.body;

  const newProfile = await ClientProfile.create({
    user: userId,
    ...req.body,
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Client profile created successfully",
    data: newProfile,
  });
});

export const updateClientProfile = catchAsync(async (req, res) => {
  const userId = req.user!.id;

  const profile = await ClientProfile.findOne({
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!profile) {
    throw new AppError("Client profile not found", 400);
  }

  const { body, files } = req;

  const updatedData: any = { ...body };

  const filesMap = files as Record<string, Express.Multer.File[]>;

  if (filesMap?.avatar?.[0]) {
    const avatarFile = filesMap.avatar[0];

    // Delete old avatar from cloudinary if exists
    if (profile.avatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(profile.avatar.public_id);
      } catch (err) {
        console.warn("Failed to delete old avatar:", err);
      }
    }

    const uploadResult = await uploadToCloudinary(
      avatarFile.buffer,
      "DisableHelp/client/avatar",
    );

    updatedData.avatar = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    };
  }

  const updatedProfile = await ClientProfile.findByIdAndUpdate(
    profile._id,
    updatedData,
    { new: true },
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client profile updated successfully",
    data: updatedProfile,
  });
});

export const deleteClientFile = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const { fileType } = req.body;

  if (!fileType) {
    throw new AppError("fileType is required", 400);
  }

  const profile = await ClientProfile.findOne({ user: userId });
  if (!profile) throw new AppError("Client profile not found", 404);

  // File map — add new client file types here as needed
  const fileMap: Record<string, string[]> = {
    avatar: ["avatar"],
  };

  const path = fileMap[fileType];

  if (!path) {
    throw new AppError("Invalid fileType", 400);
  }

  // Traverse the path to find the file
  let currentObj: Record<string, any> = profile as any;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (key && !currentObj[key]) currentObj[key] = {};
    if (key) currentObj = currentObj[key] as Record<string, any>;
  }

  const lastKey = path[path.length - 1];
  if (!lastKey) throw new AppError("Invalid file path", 400);

  const fileData = currentObj[lastKey];

  if (!fileData?.public_id) {
    throw new AppError("File not found", 404);
  }

  // Delete from cloudinary
  try {
    await cloudinary.uploader.destroy(fileData.public_id);
  } catch (err) {
    console.warn(`Failed to delete file ${fileData.public_id}:`, err);
  }

  // Clear the file reference
  currentObj[lastKey] = { url: "", public_id: "" };

  const updatedProfile = await profile.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "File deleted successfully",
    data: updatedProfile,
  });
});

export const getMyProfile = catchAsync(async (req, res) => {
  const userId = req.user!.id;

  if (!userId || typeof userId !== "string") {
    throw new AppError("Invalid user id", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id format", 400);
  }

  const profile = await WorkerProfile.findOne({ user: userId })
    .populate("user", "name email")
    .lean();

  if (!profile) {
    throw new AppError("User Profile not found", 404);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile fetched successfully",
    data: profile,
  });
});

export const getProfileById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    throw new AppError("Invalid user id", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id format", 400);
  }

  const profile = await WorkerProfile.findOne({ user: userId })
    .populate("user", "name email")
    .lean();

  if (!profile) {
    throw new AppError("User Profile not found", 404);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile fetched successfully",
    data: profile,
  });
});

export const getProfileStatus = catchAsync(async (req, res) => {
  console.log("CONTROLLER HIT"); // 🔥 debug

  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    throw new AppError("User not authenticated", 401);
  }

  // Fetch profile as plain JS object (lean) to avoid circular refs
  let profile: any = null;

  if (userRole === "worker") {
    profile = await WorkerProfile.findOne({ user: userId }).lean();
  } else if (userRole === "client") {
    profile = await ClientProfile.findOne({ user: userId }).lean();
  } else {
    throw new AppError("Invalid role", 400);
  }

  if (!profile) {
    throw new AppError("Profile not found", 404);
  }

  // Universal isFilled checker for deep nested objects/arrays
  const isFilled = (value: any, isBooleanField = false): boolean => {
    if (value === undefined || value === null) return false;

    if (isBooleanField && typeof value === "boolean") return true;

    if (typeof value === "string") return value.trim().length > 0;

    if (typeof value === "number") return true;

    if (Array.isArray(value)) {
      // At least one item is filled
      return (
        value.length > 0 && value.some((item) => isFilled(item, isBooleanField))
      );
    }

    if (typeof value === "object") {
      // If object has boolean-only fields, consider true even if false
      return Object.values(value).some((val) => {
        if (typeof val === "boolean") return true; // boolean field exists
        return isFilled(val, isBooleanField);
      });
    }

    return false;
  };

  // Define worker and client fields to check
  let status: { field: string; completed: boolean }[] = [];

  if (userRole === "worker") {
    status = [
      { field: "services", completed: isFilled(profile.services) },
      { field: "rates", completed: isFilled(profile.rates) },
      {
        field: "availability",
        completed: isFilled(profile.availability),
      },
      { field: "locations", completed: isFilled(profile.locations) },
      {
        field: "experienceSummary",
        completed: isFilled(profile.experienceSummary),
      },
      { field: "bankDetails", completed: isFilled(profile.bankDetails) },
      { field: "workHistory", completed: isFilled(profile.workHistory) },
      {
        field: "educationAndTraining",
        completed: isFilled(profile.educationAndTraining),
      },
      {
        field: "personalDetails",
        completed: isFilled(profile.personalDetails),
      },
      {
        field: "freeMeetAndGreet",
        completed: isFilled(profile.freeMeetAndGreet, true),
      }, // boolean
      {
        field: "lgbtqiaPlusFriendly",
        completed: isFilled(profile.lgbtqiaPlusFriendly, true),
      },
      { field: "immunisation", completed: isFilled(profile.immunisation) },
      { field: "languages", completed: isFilled(profile.languages) },
      {
        field: "culturalBackground",
        completed: isFilled(profile.culturalBackground),
      },
      { field: "religion", completed: isFilled(profile.religion) },
      { field: "interests", completed: isFilled(profile.interests) },
      { field: "aboutMe", completed: isFilled(profile.aboutMe) },
      { field: "preferences", completed: isFilled(profile.preferences) },
    ];
  } else if (userRole === "client") {
    status = [
      { field: "participants", completed: isFilled(profile.participants) },
      {
        field: "carePreferences",
        completed: isFilled(profile.carePreferences),
      },
      {
        field: "receiveAgreementsEmails",
        completed: profile.receiveAgreementsEmails !== undefined,
      },
      {
        field: "receiveEventDeliveriesEmails",
        completed: profile.receiveEventDeliveriesEmails !== undefined,
      },
      {
        field: "receivePlannedSessionReminderEmails",
        completed: profile.receivePlannedSessionReminderEmails !== undefined,
      },
      {
        field: "isNdisManaged",
        completed: profile.isNdisManaged !== undefined,
      },
    ];
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile status fetched successfully",
    data: status,
  });
});
