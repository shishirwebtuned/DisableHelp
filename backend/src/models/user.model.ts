import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import type { IUser } from "../types/type.js";

const userSchema = new Schema<IUser>(
  {
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

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    phoneNumber: { type: String, required: true },
    address: {
      line1: String,
      line2: String,
      state: String,
      postalCode: String,
    },

    notificationSettings: {
      receiveSms: { type: Boolean, default: true },
      receiveEmails: { type: Boolean, default: true },
    },
    phoneVerified: { type: Boolean, default: false },
    consentToCollectSensitiveInformation: {
      type: Boolean,
      default: false,
    },

    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    approved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    timezone: { type: String, default: "Australia/Perth" },
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
