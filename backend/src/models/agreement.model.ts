import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
    },
    period: [timeSlotSchema],
  },
  { _id: false },
);

const agreementSchema = new mongoose.Schema(
  {
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

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "terminated", "completed"],
      default: "pending",
    },

    hourlyRate: {
      type: Number,
      required: true,
    },
    termsAcceptedByWorker: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
    },

    startDate: {
      type: Date,
      required: true,
    },

    schedule: [scheduleSchema],

    terminatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    terminatedByRole: {
      type: String,
      enum: ["client", "worker", "admin"],
    },
    terminationReason: {
      type: String,
    },

    terminatedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

agreementSchema.index({ job: 1, worker: 1 }, { unique: true });

agreementSchema.index({ client: 1 });
agreementSchema.index({ worker: 1 });
agreementSchema.index({ status: 1 });

export const Agreement = mongoose.model("Agreement", agreementSchema);
export type AgreementDocument = mongoose.InferSchemaType<
  typeof agreementSchema
>;
