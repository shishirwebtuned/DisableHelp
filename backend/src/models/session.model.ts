import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    agreement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true, index: true },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
    },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },

    notes: {
      type: String,
    },

    completedAt: Date,

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledByRole: {
      type: String,
      enum: ["client", "worker", "admin"],
    },

    cancelledAt: {
      type: Date,
    },

    cancelledReason: {
      type: String,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ worker: 1, date: 1 });
sessionSchema.index({ client: 1, date: 1 });
sessionSchema.index({ agreement: 1 });
sessionSchema.index({ worker: 1, startTime: 1 });

export const Session = mongoose.model("Session", sessionSchema);
export type SessionDocument = mongoose.InferSchemaType<typeof sessionSchema>;
