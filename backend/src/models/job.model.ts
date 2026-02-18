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

const supportDetailSchema = new Schema(
  {
    name: { type: String, required: true },
    details: { type: [String], required: true },
  },
  { _id: false },
);

const jobSchema = new Schema({
  startDate: { type: Date },
  frequency: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "fortnightly", "monthly"],
  },
  location: {
    line1: { type: String, required: true },
    line2: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  duration: {
    session: { type: Number, required: true },
    hours: { type: Number, required: true },
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  supportDetails: [supportDetailSchema],
  jobSessions: [sessionSchema],
  preference: {
    gender: { type: String, enum: ["male", "female", "other"] },
    others: [String],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

export const Job = mongoose.model("Job", jobSchema);
export type JobDocument = mongoose.InferSchemaType<typeof jobSchema>;
