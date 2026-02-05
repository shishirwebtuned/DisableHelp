import multer from "multer";
import streamifier from "streamifier";
import { WorkerProfile } from "../models/workerProfile.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import cloudinary from "../utils/cloudinary.js";
const storage = multer.memoryStorage();
export const upload = multer({ storage });
export const createWorkerProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const existingProfile = await WorkerProfile.findOne({ user: userId });
    if (existingProfile) {
        throw new AppError("Worker profile already exists", 400);
    }
    let uploadedImage = null;
    if (req.file) {
        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "Oscardriving/clients" }, (error, result) => {
                    if (error)
                        return reject(error);
                    resolve(result);
                });
                streamifier.createReadStream(fileBuffer).pipe(uploadStream);
            });
        };
        uploadedImage = await uploadToCloudinary(req.file.buffer);
    }
    const { gender, services, rates, freeMeetAndGreet, availability, locations, experienceSummary, bankDetails, workHistory, educationAndTraining, ndisWorkerScreening, lgbtqiaPlusFriendly, immunisation, languages, culturalBackground, religion, interests, aboutMe, preferences, personalDetails, } = req.body;
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
        personalDetails,
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
    const profileData = req.body;
    const updatedProfile = await WorkerProfile.findOneAndUpdate({ user: userId }, profileData, { new: true, runValidators: true });
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
//# sourceMappingURL=profile.controller.js.map