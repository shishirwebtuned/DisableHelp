import mongoose, { Schema } from "mongoose";

export interface IClientProfile {
  user: mongoose.Types.ObjectId;

  participants: mongoose.Types.ObjectId[];

  carePreferences?: string[];

  receiveAgreementsEmails: boolean;
  receiveEventDeliveriesEmails: boolean;
  receivePlannedSessionReminderEmails: boolean;

  isNdisManaged: boolean;
}

const clientProfileSchema = new Schema<IClientProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

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

    isNdisManaged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const ClientProfile = mongoose.model<IClientProfile>(
  "ClientProfile",
  clientProfileSchema,
);
