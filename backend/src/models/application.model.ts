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
    availability: [sessionSchema],
  },
  { timestamps: true },
);

export const Application = mongoose.model("Application", applicationSchema);
export type ApplicationDocument = mongoose.InferSchemaType<
  typeof applicationSchema
>;
