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
import { ClientProfile, } from "../models/clientProfile.model.js";
const storage = multer.memoryStorage();
export const upload = multer({ storage }).fields([
    { name: "avatar", maxCount: 1 },
    { name: "cprFile", maxCount: 1 },
    { name: "driverLicenseFile", maxCount: 1 },
    { name: "firstAidFile", maxCount: 1 },
    { name: "wwccFile", maxCount: 1 },
]);
export const createWorkerProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("Invalid user id", 400);
    }
    const existingProfile = await WorkerProfile.exists({
        user: new mongoose.Types.ObjectId(userId),
    });
    if (existingProfile) {
        throw new AppError("Worker profile already exists", 400);
    }
    const { gender, services, rates, freeMeetAndGreet, availability, locations, experienceSummary, bankDetails, workHistory, educationAndTraining, ndisWorkerScreening, lgbtqiaPlusFriendly, immunisation, languages, culturalBackground, religion, interests, aboutMe, preferences, personalDetails, } = req.body;
    const files = req.files;
    const personalDetailsData = {
        bio: personalDetails?.bio,
    };
    if (files?.avatar?.[0]) {
        const avatar = await uploadToCloudinary(files.avatar[0].buffer, "DisableHelp/supportWorker/avatar");
        personalDetailsData.avatar = {
            url: avatar.url,
            public_id: avatar.public_id,
        };
    }
    personalDetailsData.additionalTraining = {};
    if (files?.cprFile?.[0]) {
        const cpr = await uploadToCloudinary(files.cprFile[0].buffer, "DisableHelp/supportWorker/cpr");
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
        const license = await uploadToCloudinary(files.driverLicenseFile[0].buffer, "DisableHelp/supportWorker/driverLicense");
        personalDetailsData.additionalTraining.driverLicense = {
            expiryDate: personalDetails?.additionalTraining?.driverLicense?.expiryDate,
            file: {
                url: license.url,
                public_id: license.public_id,
            },
            isVerified: false,
        };
    }
    if (files?.firstAidFile?.[0]) {
        const firstAid = await uploadToCloudinary(files.firstAidFile[0].buffer, "DisableHelp/supportWorker/firstAid");
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
        const wwcc = await uploadToCloudinary(files.wwccFile[0].buffer, "DisableHelp/supportWorker/wwcc");
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
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("Invalid user id", 400);
    }
    const profile = await WorkerProfile.findOne({ user: userId });
    if (!profile) {
        throw new AppError("Worker profile not found", 400);
    }
    const { body, files } = req;
    const updatedData = { ...body };
    const personalDetailsData = { ...(profile.personalDetails || {}) };
    const fileMap = {
        avatar: ["avatar"],
        cprFile: ["additionalTraining", "cpr", "file"],
        driverLicenseFile: ["additionalTraining", "driverLicense", "file"],
        firstAidFile: ["additionalTraining", "firstAid", "file"],
        wwccFile: ["wwcc", "file"],
    };
    const filesMap = files;
    for (const [fieldName, path] of Object.entries(fileMap)) {
        const fileArray = filesMap?.[fieldName];
        if (!fileArray?.[0])
            continue;
        let currentObj = personalDetailsData;
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (key && !currentObj[key])
                currentObj[key] = {};
            if (key)
                currentObj = currentObj[key];
        }
        const lastKey = path[path.length - 1];
        const oldFile = lastKey
            ? currentObj[lastKey]
            : undefined;
        if (oldFile?.public_id) {
            try {
                await cloudinary.uploader.destroy(oldFile.public_id);
            }
            catch (err) {
                console.warn(`Failed to delete old file ${oldFile.public_id}:`, err);
            }
        }
        const uploadResult = await uploadToCloudinary(fileArray[0].buffer, `DisableHelp/supportWorker/${fieldName.replace("File", "")}`);
        let value = {
            url: uploadResult.url,
            public_id: uploadResult.public_id,
        };
        if (fieldName !== "avatar") {
            value.isVerified = false;
            const expiry = body.personalDetails?.additionalTraining?.[fieldName.replace("File", "")]?.expiryDate;
            if (expiry)
                value.expiryDate = expiry;
            if (fieldName === "wwccFile") {
                value.wwccNumber = body.personalDetails?.wwcc?.wwccNumber;
                if (body.personalDetails?.wwcc?.expiryDate)
                    value.expiryDate = body.personalDetails.wwcc.expiryDate;
            }
        }
        setNestedValue(personalDetailsData, path, value);
    }
    updatedData.personalDetails = personalDetailsData;
    const updatedProfile = await WorkerProfile.findByIdAndUpdate(profile._id, updatedData, { new: true });
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Worker profile updated successfully",
        data: updatedProfile,
    });
});
export const createClientProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
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
    const userId = req.user.id;
    const profile = await ClientProfile.findOne({
        user: new mongoose.Types.ObjectId(userId),
    });
    if (!profile) {
        throw new AppError("Client profile not found", 400);
    }
    const { body } = req;
    const updatedData = { ...body };
    const updatedProfile = await ClientProfile.findByIdAndUpdate(profile._id, updatedData, { new: true });
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Worker profile updated successfully",
        data: updatedProfile,
    });
});
export const getMyProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
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
    console.log("CONTROLLER HIT"); // 🔥 add this
    const userId = req.user.id;
    console.log("userId", userId);
    // const userId = req.params;
    const userRole = req.user.role;
    let profile = null;
    if (userRole === "worker") {
        profile = await WorkerProfile.findOne({ user: userId });
    }
    else if (userRole === "client") {
        profile = await ClientProfile.findOne({ user: userId });
    }
    else {
        throw new AppError("Invalid role", 400);
    }
    if (!profile) {
        throw new AppError("Profile not found", 404);
    }
    const isFilled = (value) => {
        if (value === undefined || value === null)
            return false;
        if (Array.isArray(value))
            return value.length > 0;
        if (typeof value === "object")
            return Object.keys(value).length > 0;
        return true;
    };
    let status = [];
    if (userRole === "worker") {
        const workerProfile = profile;
        status = [
            { field: "services", completed: isFilled(workerProfile.services) },
            { field: "rates", completed: isFilled(workerProfile.rates) },
            {
                field: "availability",
                completed: isFilled(workerProfile.availability),
            },
            { field: "locations", completed: isFilled(workerProfile.locations) },
            {
                field: "experienceSummary",
                completed: isFilled(workerProfile.experienceSummary),
            },
            { field: "bankDetails", completed: isFilled(workerProfile.bankDetails) },
            { field: "workHistory", completed: isFilled(workerProfile.workHistory) },
            {
                field: "educationAndTraining",
                completed: isFilled(workerProfile.educationAndTraining),
            },
            {
                field: "personalDetails",
                completed: isFilled(workerProfile.personalDetails),
            },
        ];
    }
    else if (userRole === "client") {
        const clientProfile = profile;
        status = [
            {
                field: "participants",
                completed: isFilled(clientProfile.participants),
            },
            {
                field: "carePreferences",
                completed: isFilled(clientProfile.carePreferences),
            },
            {
                field: "receiveAgreementsEmails",
                completed: clientProfile.receiveAgreementsEmails !== undefined,
            },
            {
                field: "receiveEventDeliveriesEmails",
                completed: clientProfile.receiveEventDeliveriesEmails !== undefined,
            },
            {
                field: "receivePlannedSessionReminderEmails",
                completed: clientProfile.receivePlannedSessionReminderEmails !== undefined,
            },
            {
                field: "isNdisManaged",
                completed: clientProfile.isNdisManaged !== undefined,
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
//# sourceMappingURL=profile.controller.js.map