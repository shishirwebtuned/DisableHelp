import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: "message" | "invoice" | "application" | "agreement" | "job" | "system";
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  chat?: mongoose.Types.ObjectId;
  job?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["message", "invoice", "application", "agreement", "job", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    actionUrl: { type: String },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    job: { type: Schema.Types.ObjectId, ref: "Job" },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, read: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
