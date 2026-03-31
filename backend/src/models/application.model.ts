import mongoose, { Schema } from "mongoose";

const timeSlotSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const sessionSchema = new Schema({
  day: {
    type: String,
    required: true,
  },
  period: [timeSlotSchema],
});

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    introduction: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
      required: true,
    },
    hourlyRate: {
      type: String,
      required: true,
    },
    availability: [sessionSchema],
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });

export const Application = mongoose.model("Application", applicationSchema);
export type ApplicationDocument = mongoose.InferSchemaType<
  typeof applicationSchema
>;
