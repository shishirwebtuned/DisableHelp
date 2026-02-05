export function getEmailErrorMessage(err) {
    if (err.code === "EENVELOPE" || err.responseCode === 553) {
        return "Invalid email address";
    }
    if (err.responseCode === 552) {
        return "Recipient mailbox is full";
    }
    if (err.code === "ECONNECTION" || err.code === "ETIMEDOUT") {
        return "Email service is temporarily unavailable";
    }
    if (err.code === "EAUTH") {
        return "Email service authentication failed";
    }
    return "Failed to send email";
}
//# sourceMappingURL=getEmailErrorMessage.js.map