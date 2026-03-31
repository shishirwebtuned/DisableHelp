import mongoose, { Schema } from "mongoose";
import type { Gender } from "../types/type.js";

export interface IClientProfile {
  user: mongoose.Types.ObjectId;
  gender: Gender;

  participants: mongoose.Types.ObjectId[];

  carePreferences?: string[];

  receiveAgreementsEmails: boolean;
  receiveEventDeliveriesEmails: boolean;
  receivePlannedSessionReminderEmails: boolean;

  // isNdisManaged: boolean;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };

  avatar?: {
    url: string;
    public_id: string;
  };
}

const clientProfileSchema = new Schema<IClientProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
      required: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    avatar: {
      url: String,
      public_id: String,
    },
    carePreferences: [String],

    receiveAgreementsEmails: {
      type: Boolean,
      default: true,
    },
    receiveEventDeliveriesEmails: {
      type: Boolean,
      default: true,
    },
    receivePlannedSessionReminderEmails: {
      type: Boolean,
      default: true,
    },

    // isNdisManaged: {
    //   type: Boolean,
    //   default: false,
    // },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
  },
  { timestamps: true },
);

export const ClientProfile = mongoose.model<IClientProfile>(
  "ClientProfile",
  clientProfileSchema,
);
