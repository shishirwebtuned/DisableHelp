import cron from "node-cron";
import { Payment } from "../models/payment.model.js";
import { sendEmail } from "./sendEmail.js";
import { Notification } from "../models/notification.model.js";

export const startPaymentReminderJob = (io: any) => {
  cron.schedule("0 8 * * *", async () => {
    // cron.schedule("* * * * *", async () => {
    console.log("Running payment reminder job...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const overduePayments = await Payment.find({
        status: "successful",
        nextPaymentDate: { $lte: today },
      })
        .populate("worker", "firstName lastName email")
        .populate("client", "firstName lastName email")
        .lean();

      // Deduplicate to latest payment per worker+client pair
      const seen = new Set<string>();
      const toNotify = overduePayments.filter((p) => {
        const key = `${(p.worker as any)._id}-${(p.client as any)._id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      for (const payment of toNotify) {
        const worker = payment.worker as any;
        const client = payment.client as any;

        // Skip if worker already paid for this client after this payment
        const newerPayment = await Payment.findOne({
          worker: worker._id,
          client: client._id,
          status: "successful",
          paymentDate: { $gt: payment.paymentDate },
        });
        if (newerPayment) continue;

        const clientName = `${client.firstName} ${client.lastName}`;
        const workerName = `${worker.firstName} ${worker.lastName}`;
        const dueDate = payment.nextPaymentDate
          ? new Date(payment.nextPaymentDate).toDateString()
          : "an unknown date";

        await sendEmail({
          to: worker.email,
          subject: `Payment Due for Client ${clientName}`,
          html: `
                        <h2>Hi ${workerName},</h2>
                        <p>Your monthly payment for client <strong>${clientName}</strong> was due on <strong>${new Date(dueDate).toDateString()}</strong>.</p>
                        <p>Please log in and complete your payment to continue providing services.</p>
                        <br/>
                        
                        <p style="color:#888;font-size:13px;">If you've already made this payment, please disregard this email.</p>
                    `,
        });

        const notification = await Notification.create({
          recipient: worker._id,
          sender: client._id,
          type: "system",
          title: "Payment Due",
          actionUrl: "/worker/payments",
          message: `Your monthly payment for client ${clientName} is due. Please complete the payment to continue services.`,
        });

        io.to(`user:${worker._id}`).emit("newNotification", notification);

        console.log(
          `Reminder sent to ${worker.email} for client ${clientName}`,
        );
      }

      console.log(
        `Payment reminder job done. Processed ${toNotify.length} reminders.`,
      );
    } catch (err) {
      console.error("Payment reminder job failed:", err);
    }
  });
};
