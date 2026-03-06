import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    status: { type: Boolean, default: true },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    categories: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length > 0,
        "At least one category is required",
      ],
    },
  },
  { timestamps: true },
);

export const Service = mongoose.model("Service", serviceSchema);
export type ServiceDocument = mongoose.InferSchemaType<typeof serviceSchema>;
