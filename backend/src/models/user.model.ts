import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import type { IUser } from "../types/type.js";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "client", "worker"],
      required: true,
      default: "client",
    },

    phoneNumber: { type: String },
    addressLine1: { type: String },
    addressLine2: {
      suburb: { type: String },
      state: { type: String },
      postalCode: { type: String },
    },

    // Worker/Client profile
    workLocation: [{ type: String }],
    experience: { type: Number },
    passingRate: { type: Number },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    licenseNumber: { type: String },

    // Credentials & verification
    credentials: {
      ndisScreening: { type: Boolean, default: false },
      wwcc: { type: Boolean, default: false },
      driversLicense: { type: Boolean, default: false },
      firstAid: { type: Boolean, default: false },
      immunisation: { type: Boolean, default: false },
    },
    verificationStatus: {
      ndisScreening: {
        type: String,
        enum: ["pending", "verified", "rejected", "expired"],
        default: "pending",
      },
      wwcc: {
        type: String,
        enum: ["pending", "verified", "rejected", "expired"],
        default: "pending",
      },
      driversLicense: {
        type: String,
        enum: ["pending", "verified", "rejected", "expired"],
        default: "pending",
      },
      firstAid: {
        type: String,
        enum: ["pending", "verified", "rejected", "expired"],
        default: "pending",
      },
      immunisation: {
        type: String,
        enum: ["pending", "verified", "rejected", "expired"],
        default: "pending",
      },
    },

    preferences: {
      preferredHours: { type: String },
      hourlyRate: { type: Number },
      languages: [{ type: String }],
      culturalBackground: { type: String },
      religion: { type: String },
      interests: [{ type: String }],
      preferredWorkerType: { type: String },
      location: { type: String },
    },

    image: {
      url: { type: String },
      public_id: { type: String },
    },

    status: { type: String, enum: ["pending", "verified"], default: "pending" },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    jobsPosted: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    agreements: [{ type: Schema.Types.ObjectId, ref: "Agreement" }],
    invoices: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = mongoose.model<IUser>("User", userSchema);
export type UserDocument = mongoose.InferSchemaType<typeof userSchema>;
