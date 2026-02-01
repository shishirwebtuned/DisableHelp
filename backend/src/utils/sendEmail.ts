import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments,
}: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
      debug: true,
    });

    const info = await transporter.sendMail({
      from: `"Oscar Driving School" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
};
