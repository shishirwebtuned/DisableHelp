import type { IPayment } from "../models/payment.model.js";

export const calculatePaymentDue = (lastPayment: IPayment | null) => {
  const amount = 100;

  let lateFee = 0;

  let nextPaymentDate: Date;

  let lastPaymentDate: Date | null = null;

  let amountDue = amount;

  const today = new Date();

  if (lastPayment) {
    lastPaymentDate = lastPayment.paymentDate;

    nextPaymentDate = lastPayment.nextPaymentDate || new Date(lastPaymentDate);

    if (today < nextPaymentDate) {
      amountDue = 0; // ✅ already paid
    } else {
      const diffDays =
        (today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24);

      lateFee = diffDays > 7 ? 15 : 0;

      amountDue = amount + lateFee;
    }
  } else {
    nextPaymentDate = new Date(today);

    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    amountDue = amount;
  }

  return {
    amountDue,

    baseAmount: amount,

    lateFee,

    lastPaymentDate,

    nextPaymentDate,
  };
};
