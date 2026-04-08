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
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    notes: {
      type: String,
    },
    file: {
      url: { type: String },
      public_id: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
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
