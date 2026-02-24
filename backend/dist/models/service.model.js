import mongoose, { Schema } from "mongoose";
import { title } from "node:process";
const serviceSchema = new Schema({
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
            (val) => val.length > 0,
            "At least one category is required",
        ],
    },
}, { timestamps: true });
export const Service = mongoose.model("Service", serviceSchema);
//# sourceMappingURL=service.model.js.map