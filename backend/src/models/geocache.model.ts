import mongoose, { Schema } from "mongoose";

const geoCacheSchema = new Schema(
  {
    address: { type: String, required: true, unique: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { timestamps: true },
);

export const GeoCache = mongoose.model("GeoCache", geoCacheSchema);
