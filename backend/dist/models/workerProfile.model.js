import mongoose, { Schema } from "mongoose";
const timeSlotSchema = new Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
}, { _id: false });
export const dailyAvailabilitySchema = new Schema({
    available: { type: Boolean, default: false },
    times: [timeSlotSchema],
}, { _id: false });
const careCategorySchema = new Schema({
    description: { type: String, default: "" },
    experience: {
        type: [String],
        default: [],
    },
    knowledge: {
        type: [String],
        default: [],
    },
}, { _id: false });
const workerProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: false,
    },
    services: { type: [String], default: [] },
    rates: {
        type: [
            {
                name: String,
                rate: Number,
            },
        ],
        default: [],
    },
    freeMeetAndGreet: { type: Boolean, default: false },
    availability: {
        available: { type: Boolean, default: false },
        monday: dailyAvailabilitySchema,
        tuesday: dailyAvailabilitySchema,
        wednesday: dailyAvailabilitySchema,
        thursday: dailyAvailabilitySchema,
        friday: dailyAvailabilitySchema,
        saturday: dailyAvailabilitySchema,
        sunday: dailyAvailabilitySchema,
        desiredHours: Number,
        hasOvernightAvailability: { type: Boolean, default: false },
        availabilityUpdatedAt: Date,
    },
    locations: [
        {
            id: String,
            name: String,
            postalCode: String,
            state: String,
            suburb: String,
        },
    ],
    experienceSummary: {
        disability: { type: careCategorySchema, default: undefined },
        agedCare: { type: careCategorySchema, default: undefined },
        mentalHealth: { type: careCategorySchema, default: undefined },
        chronicMedicalCondition: { type: careCategorySchema, default: undefined },
    },
    bankDetails: {
        accountName: String,
        bankName: String,
        bsb: String,
        accountNumber: String,
        bankResponsibility: { type: Boolean, default: false },
    },
    workHistory: [
        {
            organisation: String,
            jobTitle: String,
            startDate: Date,
            currentlyWorkingHere: Boolean,
            endDate: Date,
        },
    ],
    educationAndTraining: [
        {
            institution: String,
            course: String,
            startDate: Date,
            currentlyStudyingHere: Boolean,
            endDate: Date,
        },
    ],
    ndisWorkerScreening: {
        legal_first_name: String,
        legal_middle_name: String,
        legal_last_name: String,
        date_of_birth: Date,
        screening_number: String,
        expiry_date: Date,
        status: String,
    },
    lgbtqiaPlusFriendly: { type: Boolean, default: false },
    immunisation: {
        hasSeasonalFluShot: { type: Boolean, default: false },
        covidVaccineStatus: {
            type: String,
            enum: ["fullyVaccinated", "medicalCondition", "remoteWorker"],
        },
        statusConfirmed: { type: Boolean, default: false },
    },
    languages: {
        firstLanguages: [String],
        secondLanguages: [String],
    },
    culturalBackground: [String],
    religion: [String],
    interests: [String],
    aboutMe: {
        nonSmoker: { type: Boolean, default: false },
        petFriendly: { type: Boolean, default: false },
        personality: {
            type: String,
            enum: ["outgoing", "relaxed"],
        },
    },
    preferences: [String],
    personalDetails: {
        avatar: {
            url: String,
            publicId: String,
        },
        bio: String,
        additionalTraining: {
            cpr: {
                expiryDate: Date,
                file: {
                    url: String,
                    publicId: String,
                },
                isVerified: { type: Boolean, default: false },
            },
            driverLicense: {
                expiryDate: Date,
                file: {
                    url: String,
                    publicId: String,
                },
                isVerified: { type: Boolean, default: false },
            },
            firstAid: {
                expiryDate: Date,
                file: {
                    url: String,
                    publicId: String,
                },
                isVerified: { type: Boolean, default: false },
            },
        },
        wwcc: {
            wwccNumber: String,
            expiryDate: Date,
            file: {
                url: String,
                publicId: String,
            },
            isVerified: { type: Boolean, default: false },
        },
    },
    approved: { type: Boolean, default: false },
    hasActiveAgreement: { type: Boolean, default: false },
}, { timestamps: true });
export const WorkerProfile = mongoose.model("WorkerProfile", workerProfileSchema);
//# sourceMappingURL=workerProfile.model.js.map