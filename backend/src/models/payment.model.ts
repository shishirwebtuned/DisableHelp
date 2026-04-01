import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  worker: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  amount: number;
  lateFee?: number;
  totalAmount: number;
  paymentDate: Date;
  nextPaymentDate?: Date;
  status: "pending" | "successful" | "failed";
  paymentMethod: string;
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    worker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, default: 100 },
    lateFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    nextPaymentDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    paymentReference: { type: String },
  },
  { timestamps: true },
);

PaymentSchema.pre("validate", function () {
  const payment = this as IPayment;

  if (payment.nextPaymentDate) {
    const lateDays =
      (payment.paymentDate.getTime() - payment.nextPaymentDate.getTime()) /
      (1000 * 60 * 60 * 24);

    payment.lateFee = lateDays > 7 ? 15 : 0;
  } else {
    payment.lateFee = 0;
  }

  payment.totalAmount = payment.amount + (payment.lateFee || 0);

  const nextMonth = new Date(payment.paymentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  payment.nextPaymentDate = nextMonth;
});

export const Payment = mongoose.model("Payment", PaymentSchema);
export type PaymentDocument = mongoose.InferSchemaType<typeof PaymentSchema>;
