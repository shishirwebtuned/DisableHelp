// models/invoice.model.ts
import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },

    declineReason: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    declinedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

invoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const last = await mongoose
      .model("Invoice")
      .findOne()
      .sort({ createdAt: -1 })
      .select("invoiceNumber");

    let nextNumber = 1;
    if (last?.invoiceNumber) {
      const lastNumber = parseInt(last.invoiceNumber.replace("INV-", ""), 10);
      nextNumber = lastNumber + 1;
    }

    this.invoiceNumber = `INV-${String(nextNumber).padStart(5, "0")}`;
  }
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
