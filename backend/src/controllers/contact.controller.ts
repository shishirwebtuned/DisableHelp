import { sendResponse } from "../utils/sendResponse.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendEmail } from "../utils/sendEmail.js";
import { AppError } from "../utils/AppError.js";
import validator from "validator";

export const submitContact = catchAsync(async (req, res) => {
  const { name, email, number, reason, message } = req.body;

  if (!name || !email || !number || !reason || !message) {
    throw new AppError("All fields are required", 400);
  }

  if (!validator.isEmail(email)) {
    throw new AppError("Invalid email address", 400);
  }

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e3dc;">

      <!-- Header -->
      <div style="background:#1a1a2e;padding:28px 32px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#4f46e5;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div style="display:inline-block;vertical-align:middle;margin-left:12px;">
            <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">New Contact Submission</p>
            <p style="margin:0;color:#9b99b0;font-size:12px;">Disable Help — Contact Form</p>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">

        <!-- Reason badge -->
        <div style="display:inline-block;background:#eef2ff;color:#4338ca;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:20px;">${reason}</div>

        <!-- Contact card -->
        <div style="background:#f9f8f6;border-radius:8px;padding:20px;margin-bottom:20px;">
          <div style="padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #eae8e1;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a2e;">${name}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">${email}</p>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;width:110px;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Phone</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${number}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Reason</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${reason}</td>
            </tr>
          </table>
        </div>

        <!-- Message -->
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Message</p>
        <div style="background:#f9f8f6;border-left:3px solid #4f46e5;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${message}</p>
        </div>

        <!-- Footer -->
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eae8e1;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0;">Received via contact form &middot; Disable Help</p>
        </div>

      </div>
    </div>
  </div>
</body>
</html>`;

  const emailText = `
New Contact Form Submission
---------------------------
Name:    ${name}
Email:   ${email}
Phone:   ${number}
Reason:  ${reason}

Message:
${message}
  `;

  const confirmationHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e3dc;">

      <!-- Header -->
      <div style="background:#1a1a2e;padding:36px 32px;text-align:center;">
        <div style="width:52px;height:52px;border-radius:50%;background:#22c55e;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Message received!</p>
        <p style="margin:6px 0 0;color:#9b99b0;font-size:13px;">We'll be in touch shortly</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">

        <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
          Thank you for reaching out to <strong>Disable Help</strong>. We've received your message and a member of our team will get back to you as soon as possible — usually within 1–2 business days.
        </p>

        <!-- Message recap -->
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Your message</p>
        <div style="background:#f9f8f6;border-left:3px solid #4f46e5;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${message}</p>
        </div>

        <!-- Info callout -->
        <div style="background:#eef2ff;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#4338ca;line-height:1.6;">
            If your matter is urgent, please call us directly or visit our website for immediate support options.
          </p>
        </div>

        <!-- Footer -->
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid #eae8e1;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0 0 4px;">Disable Help — Supporting independence every day</p>
          <p style="font-size:11px;color:#c4c2ba;margin:0;">info@disablehelp.com.au</p>
        </div>

      </div>
    </div>
  </div>
</body>
</html>`;

  const confirmationText = `
Hi ${name},

Thank you for contacting Disable Help. We have received your message and will get back to you shortly — usually within 1–2 business days.

Your Message:
${message}

If your matter is urgent, please call us directly or visit our website for immediate support options.

—
Disable Help — Supporting independence every day
info@disablehelp.com.au
  `;

  const adminEmail =
    process.env.ADMIN_CONTACT_EMAIL || "info@disablehelp.com.au";

  await sendEmail({
    to: adminEmail,
    subject: `New Contact Form Submission - ${reason}`,
    html: emailHtml,
    text: emailText,
  });

  await sendEmail({
    to: email,
    subject: "We received your message - Disable Help",
    html: confirmationHtml,
    text: confirmationText,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Contact form submitted successfully. We will contact you soon.",
  });
});

export const submitWorkerChange = catchAsync(async (req, res) => {
  const {
    name,
    number,
    email,
    contactMethod,
    currentWorkerType,
    currentWorkerName,
    supportTime,
    reason,
    additionalInfo,
    preferredWorkerGender,
    preferredLanguages,
    preferredSupportType,
  } = req.body;

  if (
    !name ||
    !number ||
    !email ||
    !contactMethod ||
    !currentWorkerType ||
    !currentWorkerName ||
    !supportTime ||
    !reason ||
    !preferredSupportType
  ) {
    throw new AppError("All required fields must be provided", 400);
  }

  if (!validator.isEmail(email)) {
    throw new AppError("Invalid email address", 400);
  }

  if (!validator.isMobilePhone(number)) {
    throw new AppError("Invalid phone number", 400);
  }

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ─── Admin Notification Email ───────────────────────────────────────────────

  const emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e3dc;">

      <!-- Header -->
      <div style="background:#1a1a2e;padding:28px 32px;">
        <div style="width:36px;height:36px;border-radius:50%;background:#7c3aed;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div style="display:inline-block;vertical-align:middle;margin-left:12px;">
          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">New Worker Change Request</p>
          <p style="margin:0;color:#9b99b0;font-size:12px;">Disable Help — Worker Change Form</p>
        </div>
      </div>

      <div style="padding:28px 32px;">

        <!-- Reason badge -->
        <div style="display:inline-block;background:#f3f0ff;color:#6d28d9;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:20px;">${preferredSupportType}</div>

        <!-- Requester card -->
        <div style="background:#f9f8f6;border-radius:8px;padding:20px;margin-bottom:20px;">
          <div style="padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #eae8e1;">
            <div style="display:inline-block;vertical-align:middle;margin-left:12px;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a2e;">${name}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">${email}</p>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;width:150px;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Phone</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${number}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Contact method</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${contactMethod}</td>
            </tr>
          </table>
        </div>

        <!-- Worker details section -->
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Current worker details</p>
        <div style="background:#f9f8f6;border-radius:8px;padding:20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;width:150px;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Worker type</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${currentWorkerType}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Worker name</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${currentWorkerName}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Support time</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${supportTime}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Support type</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${preferredSupportType || "Not specified"}</td>
            </tr>
          </table>
        </div>

        <!-- Preferences section -->
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">New worker preferences</p>
        <div style="background:#f9f8f6;border-radius:8px;padding:20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;width:150px;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Gender preference</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${preferredWorkerGender || "No preference"}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Languages</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${preferredLanguages || "Not specified"}</td>
            </tr>
          </table>
        </div>

        <!-- Reason for change -->
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Reason for change</p>
        <div style="background:#f9f8f6;border-left:3px solid #7c3aed;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${reason}</p>
        </div>

        <!-- Additional info -->
        ${
          additionalInfo
            ? `
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Additional information</p>
        <div style="background:#f9f8f6;border-left:3px solid #e5e3dc;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${additionalInfo}</p>
        </div>`
            : ""
        }

        <!-- Footer -->
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eae8e1;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0;">Received via worker change form &middot; Disable Help</p>
        </div>

      </div>
    </div>
  </div>
</body>
</html>`;

  const emailText = `
New Worker Change Request
--------------------------
Name:              ${name}
Email:             ${email}
Phone:             ${number}
Contact Method:    ${contactMethod}

Current Worker
--------------------------
Worker Type:       ${currentWorkerType}
Worker Name:       ${currentWorkerName}
Support Time:      ${supportTime}
Support Type:      ${preferredSupportType || "Not specified"}

New Worker Preferences
--------------------------
Gender Preference: ${preferredWorkerGender || "No preference"}
Languages:         ${preferredLanguages || "Not specified"}

Reason for Change:
${reason}

Additional Information:
${additionalInfo || "None provided"}
  `;

  // ─── User Confirmation Email ────────────────────────────────────────────────

  const confirmationHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e3dc;">

      <!-- Header -->
      <div style="background:#1a1a2e;padding:36px 32px;text-align:center;">
        <div style="width:52px;height:52px;border-radius:50%;background:#7c3aed;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Request received!</p>
        <p style="margin:6px 0 0;color:#9b99b0;font-size:13px;">We'll be in touch within 24 hours</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">

        <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
          Thank you for submitting your worker change request to <strong>Disable Help</strong>. Our team will review your request and contact you within <strong>24 hours</strong> to discuss the available options.
        </p>

        <!-- Request summary -->
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Request summary</p>
        <div style="background:#f9f8f6;border-radius:8px;padding:20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;width:150px;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Current worker</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${currentWorkerName}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Worker type</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${currentWorkerType}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding:6px 0;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Support type</td>
              <td style="font-size:14px;color:#374151;padding:6px 0;">${preferredSupportType || "Not specified"}</td>
            </tr>
          </table>
        </div>

        <!-- Reason recap -->
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Your reason</p>
        <div style="background:#f9f8f6;border-left:3px solid #7c3aed;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${reason}</p>
        </div>

        <!-- Info callout -->
        <div style="background:#f3f0ff;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#6d28d9;line-height:1.6;">
            If your matter is urgent, please call us directly so we can assist you as quickly as possible.
          </p>
        </div>

        <!-- Footer -->
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid #eae8e1;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0 0 4px;">Disable Help — Supporting independence every day</p>
          <p style="font-size:11px;color:#c4c2ba;margin:0;">info@disablehelp.com.au</p>
        </div>

      </div>
    </div>
  </div>
</body>
</html>`;

  const confirmationText = `
Hi ${name},

Thank you for submitting your worker change request to Disable Help. Our team will review it and contact you within 24 hours to discuss the available options.

Request Summary:
  Current Worker: ${currentWorkerName}
  Worker Type:    ${currentWorkerType}
  Support Type:   ${preferredSupportType || "Not specified"}
  Languages:      ${preferredLanguages || "Not specified"}

Your Reason:
${reason}

If your matter is urgent, please call us directly.

—
Disable Help — Supporting independence every day
info@disablehelp.com.au
  `;

  // ─── Send Emails ────────────────────────────────────────────────────────────

  const adminEmail =
    process.env.ADMIN_CONTACT_EMAIL || "info@disablehelp.com.au";

  await sendEmail({
    to: adminEmail,
    subject: `Worker Change Request - ${name}`,
    html: emailHtml,
    text: emailText,
  });

  await sendEmail({
    to: email,
    subject: "Worker Change Request Received - Disable Help",
    html: confirmationHtml,
    text: confirmationText,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message:
      "Worker change request submitted successfully. We will contact you shortly.",
  });
});
