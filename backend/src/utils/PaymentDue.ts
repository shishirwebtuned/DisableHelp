import type { IPayment } from "../models/payment.model.js";

export const calculatePaymentDue = (lastPayment: IPayment | null) => {
  const amount = 100;
  let lateFee = 0;
  let nextPaymentDate: Date;
  let lastPaymentDate: Date | null = null;
  const today = new Date();

  if (lastPayment) {
    lastPaymentDate = lastPayment.paymentDate;
    nextPaymentDate = lastPayment.nextPaymentDate || new Date(lastPaymentDate);
    const diffDays =
      (today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24);
    lateFee = diffDays > 7 ? 15 : 0;
  } else {
    nextPaymentDate = new Date(today);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  }

  const totalAmount = amount + lateFee;

  return {
    amountDue: totalAmount,
    baseAmount: amount,
    lateFee,
    lastPaymentDate,
    nextPaymentDate,
  };
};
