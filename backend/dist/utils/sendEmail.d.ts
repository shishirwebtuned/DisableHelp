interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: any[];
}
export declare const sendEmail: ({ to, subject, text, html, attachments, }: EmailOptions) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export {};
//# sourceMappingURL=sendEmail.d.ts.map