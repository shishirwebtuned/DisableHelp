import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    attachments: [{ url: String, type: String }], // optional
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    editedAt: { type: Date }, // add this
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);
export type MessageDocument = mongoose.InferSchemaType<typeof messageSchema>;
