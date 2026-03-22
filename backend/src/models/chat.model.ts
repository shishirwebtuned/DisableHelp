import mongoose, { Schema, Document } from "mongoose";

const chatSchema = new Schema(
  {
    agreement: {
      type: Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
    },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    worker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export interface ChatDocument extends Document {
  agreement: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId;
  status: "pending" | "active" | "suspended";
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
}

chatSchema.index({ client: 1, worker: 1 }, { unique: true });

export const Chat = mongoose.model<ChatDocument>("Chat", chatSchema);
