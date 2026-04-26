import jsPDF from "jspdf";

// ─── Color Palette (sky blue theme) ──────────────────────────────
const BLUE_DARK = [12, 68, 124] as const; // #0C447C
const BLUE_MID = [55, 138, 221] as const; // #378ADD
const BLUE_LIGHT = [230, 241, 251] as const; // #E6F1FB
const BLUE_PALE = [245, 249, 254] as const; // near-white tint
const WHITE = [255, 255, 255] as const;
const GRAY_DARK = [20, 30, 50] as const; // body text
const GRAY_MID = [100, 116, 139] as const; // labels
const GRAY_LIGHT = [241, 245, 249] as const; // alt rows
const BORDER = [210, 222, 236] as const;
const SUCCESS = [16, 185, 129] as const;
const DANGER = [220, 60, 60] as const;

// ─── Tiny Helpers ────────────────────────────────────────────────
const setFill = (doc: jsPDF, c: readonly number[]) =>
  doc.setFillColor(c[0], c[1], c[2]);
const setRGB = (doc: jsPDF, c: readonly number[]) =>
  doc.setTextColor(c[0], c[1], c[2]);
const setStroke = (doc: jsPDF, c: readonly number[]) =>
  doc.setDrawColor(c[0], c[1], c[2]);
const rr = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 3,
  s: "F" | "FD" | "D" = "F",
) => doc.roundedRect(x, y, w, h, r, r, s);

const getUserName = (user: any) => {
  if (user && typeof user === "object") {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "N/A";
  }
  return "Unknown";
};

// ─── Main ────────────────────────────────────────────────────────
export const downloadPaymentPDF = (payment: any) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M * 2;

  const workerName = getUserName(payment.worker);
  const clientName = getUserName(payment.client);
  const isSuccess = ["successful", "success", "completed"].includes(
    payment.status?.toLowerCase(),
  );
  const statusColor = isSuccess ? SUCCESS : DANGER;
  const formattedDate = new Date(payment.paymentDate).toLocaleDateString(
    "en-AU",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  // ── Header Banner ────────────────────────────────────────────
  // Base dark bar
  setFill(doc, BLUE_DARK);
  doc.rect(0, 0, W, 50, "F");

  // Diagonal accent
  setFill(doc, BLUE_MID);
  doc.triangle(W - 55, 0, W, 0, W, 50, "F");

  // Subtle inner accent strip
  setFill(doc, [8, 80, 160]);
  doc.rect(0, 0, W, 2, "F");

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setRGB(doc, WHITE);
  doc.text("Disable Help", M, 20);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setRGB(doc, [180, 210, 240]);
  doc.text("Official Payment Receipt", M, 29);

  // "RECEIPT" label top right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  setRGB(doc, [255, 255, 255]);
  doc.text("RECEIPT", W - M, 24, { align: "right" });

  // Ref under RECEIPT
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setRGB(doc, [180, 210, 240]);
  doc.text(`Ref: ${payment.paymentReference}`, W - M, 33, { align: "right" });

  // ── Hero Amount Card ────────────────────────────────────────
  let y = 60;

  setFill(doc, BLUE_LIGHT);
  setStroke(doc, BORDER);
  doc.setLineWidth(0.3);
  rr(doc, M, y, CW, 36, 4, "FD");

  // Left: amount block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setRGB(doc, GRAY_MID);
  doc.text("TOTAL AMOUNT PAID", M + 6, y + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  setRGB(doc, BLUE_DARK);
  doc.text(`$${payment.totalAmount.toFixed(2)}`, M + 6, y + 28);

  // Right: status badge + date
  const badgeW = 32;
  setFill(doc, statusColor);
  rr(doc, W - M - badgeW - 6, y + 6, badgeW, 8, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setRGB(doc, WHITE);
  doc.text(payment.status.toUpperCase(), W - M - badgeW / 2 - 6, y + 11.5, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setRGB(doc, GRAY_MID);
  doc.text(formattedDate, W - M - 6, y + 22, { align: "right" });

  y += 44;

  // ── Parties ─────────────────────────────────────────────────
  const halfW = CW / 2 - 3;

  // Worker card
  setFill(doc, BLUE_PALE);
  setStroke(doc, BORDER);
  doc.setLineWidth(0.3);
  rr(doc, M, y, halfW, 26, 3, "FD");

  setFill(doc, BLUE_MID);
  rr(doc, M + 4, y + 4, 20, 6, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  setRGB(doc, WHITE);
  doc.text("PAID BY", M + 7, y + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setRGB(doc, GRAY_DARK);
  doc.text(workerName, M + 5, y + 19);

  // Client card
  const cx = M + halfW + 6;
  setFill(doc, BLUE_LIGHT);
  setStroke(doc, BORDER);
  rr(doc, cx, y, halfW, 26, 3, "FD");

  setFill(doc, BLUE_DARK);
  rr(doc, cx + 4, y + 4, 20, 6, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  setRGB(doc, WHITE);
  doc.text("PAID FOR", cx + 5.5, y + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setRGB(doc, GRAY_DARK);
  doc.text(clientName, cx + 5, y + 19);

  y += 34;

  // ── Payment Method ──────────────────────────────────────────
  setFill(doc, GRAY_LIGHT);
  setStroke(doc, BORDER);
  rr(doc, M, y, CW, 12, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setRGB(doc, GRAY_MID);
  doc.text("Payment Method", M + 5, y + 7.8);
  doc.setFont("helvetica", "bold");
  setRGB(doc, BLUE_MID);
  doc.text((payment.paymentMethod || "N/A").toUpperCase(), W - M - 5, y + 7.8, {
    align: "right",
  });

  y += 18;

  // ── Breakdown Table ─────────────────────────────────────────
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setRGB(doc, GRAY_DARK);
  doc.text("Payment Breakdown", M, y);

  y += 6;

  // Table header
  setFill(doc, BLUE_DARK);
  rr(doc, M, y, CW, 9, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setRGB(doc, WHITE);
  doc.text("DESCRIPTION", M + 5, y + 5.8);
  doc.text("AMOUNT", W - M - 5, y + 5.8, { align: "right" });

  y += 9;

  // Row helper
  const tableRow = (
    label: string,
    amount: string,
    shaded: boolean,
    bold = false,
  ) => {
    if (shaded) {
      setFill(doc, BLUE_PALE);
      doc.rect(M, y, CW, 9, "F");
    }
    setStroke(doc, BORDER);
    doc.setLineWidth(0.15);
    doc.rect(M, y, CW, 9, "D");

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(10);
    setRGB(doc, bold ? BLUE_DARK : GRAY_DARK);
    doc.text(label, M + 5, y + 5.8);
    setRGB(doc, bold ? BLUE_MID : GRAY_DARK);
    doc.text(amount, W - M - 5, y + 5.8, { align: "right" });
    y += 9;
  };

  tableRow("Base Amount", `$${payment.amount.toFixed(2)}`, false);
  tableRow("Late Fees", `$${payment.lateFee.toFixed(2)}`, true);

  // Total row — taller, accented
  setFill(doc, BLUE_LIGHT);
  setStroke(doc, BLUE_MID);
  doc.setLineWidth(0.5);
  rr(doc, M, y, CW, 11, 2.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setRGB(doc, BLUE_DARK);
  doc.text("Total Paid", M + 5, y + 7.2);
  setRGB(doc, BLUE_MID);
  doc.text(`$${payment.totalAmount.toFixed(2)}`, W - M - 5, y + 7.2, {
    align: "right",
  });

  y += 18;

  // ── Note / Thank You ─────────────────────────────────────────
  setFill(doc, BLUE_PALE);
  setStroke(doc, BORDER);
  doc.setLineWidth(0.3);

  // Left accent bar
  setFill(doc, BLUE_MID);
  doc.rect(M, y, 3, 18, "F");

  setFill(doc, BLUE_PALE);
  doc.rect(M + 3, y, CW - 3, 18, "F");
  setStroke(doc, BORDER);
  doc.setLineWidth(0.3);
  doc.rect(M + 3, y, CW - 3, 18, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setRGB(doc, BLUE_MID);
  doc.text("Note", M + 8, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setRGB(doc, GRAY_MID);
  doc.text(
    "Thank you for using Disable Help. This is a computer-generated receipt and requires no signature.",
    M + 8,
    y + 13,
  );

  // ── Footer ───────────────────────────────────────────────────
  const fY = H - 14;
  setFill(doc, BLUE_DARK);
  doc.rect(0, fY, W, 14, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setRGB(doc, [180, 210, 240]);
  doc.text(
    `Receipt  ·  Ref: ${payment.paymentReference}  ·  ${formattedDate}`,
    M,
    fY + 6,
  );
  doc.text("disablehelp.com.au", W - M, fY + 6, { align: "right" });
  setRGB(doc, [100, 140, 190]);
  doc.text(
    "This document is confidential and intended for the named recipient only.",
    W / 2,
    fY + 11,
    { align: "center" },
  );

  // Save
  doc.save(`Receipt_${payment.paymentReference}.pdf`);
};
