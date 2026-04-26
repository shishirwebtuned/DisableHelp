import jsPDF from "jspdf";

// ─── Color Palette ───────────────────────────────────────────────
const BLUE_DARK = [12, 68, 124] as const; // #0C447C  — hero bg
const BLUE_MID = [55, 138, 221] as const; // #378ADD  — accents
const BLUE_LIGHT = [230, 241, 251] as const; // #E6F1FB  — section bg
const WHITE = [255, 255, 255] as const;
const GRAY_DARK = [30, 30, 40] as const; // body text
const GRAY_MID = [100, 110, 130] as const; // labels
const GRAY_LIGHT = [240, 242, 246] as const; // dividers / alt rows
const BORDER = [210, 220, 235] as const; // card borders

// ─── Helpers ─────────────────────────────────────────────────────
const rgb = (doc: jsPDF, color: readonly [number, number, number]) =>
  doc.setTextColor(color[0], color[1], color[2]);

const fill = (doc: jsPDF, color: readonly [number, number, number]) =>
  doc.setFillColor(color[0], color[1], color[2]);

const stroke = (doc: jsPDF, color: readonly [number, number, number]) =>
  doc.setDrawColor(color[0], color[1], color[2]);

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const COL_W = PAGE_W - MARGIN * 2;

// Draw a rounded rect (jsPDF uses 'FD' = fill+draw, 'F' = fill only)
const roundRect = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 3,
  style: "F" | "FD" | "D" = "F",
) => doc.roundedRect(x, y, w, h, r, r, style);

// Section heading pill
const sectionHeading = (doc: jsPDF, label: string, y: number) => {
  fill(doc, BLUE_LIGHT);
  stroke(doc, BORDER);
  roundRect(doc, MARGIN, y, COL_W, 8, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  rgb(doc, BLUE_MID);
  doc.text(label.toUpperCase(), MARGIN + 4, y + 5.4);
  return y + 8 + 4; // next y
};

// Key–value row (two columns)
const kvRow = (
  doc: jsPDF,
  key: string,
  value: string,
  y: number,
  shaded = false,
) => {
  if (shaded) {
    fill(doc, GRAY_LIGHT);
    doc.rect(MARGIN, y, COL_W, 7, "F");
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rgb(doc, GRAY_MID);
  doc.text(key, MARGIN + 3, y + 4.8);

  doc.setFont("helvetica", "bold");
  rgb(doc, GRAY_DARK);
  doc.text(value, MARGIN + 55, y + 4.8);
  return y + 7;
};

// Thin divider line
const divider = (doc: jsPDF, y: number) => {
  stroke(doc, BORDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  return y + 3;
};

// Auto page-break guard
const checkPage = (doc: jsPDF, y: number, needed = 20): number => {
  if (y + needed > PAGE_H - 18) {
    doc.addPage();
    return 20;
  }
  return y;
};

// ─── Main Function ────────────────────────────────────────────────
export const downloadAgreementPDF = (agreement: any) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const agreementId = agreement._id.slice(-8).toUpperCase();
  const isActive = agreement.status?.toLowerCase() === "active";

  // ── Header Banner ──────────────────────────────────────────────
  fill(doc, BLUE_DARK);
  doc.rect(0, 0, PAGE_W, 42, "F");

  // Diagonal accent strip
  fill(doc, BLUE_MID);
  doc.triangle(PAGE_W - 50, 0, PAGE_W, 0, PAGE_W, 42, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  rgb(doc, WHITE);
  doc.text("Service Agreement", MARGIN, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rgb(doc, [180, 210, 240]);
  doc.text(`REF: ${agreementId}`, MARGIN, 25);

  // Status badge
  const statusColor = isActive
    ? ([39, 174, 96] as const)
    : ([180, 120, 0] as const);
  fill(doc, statusColor);
  roundRect(doc, MARGIN, 29, 28, 8, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  rgb(doc, WHITE);
  doc.text(agreement.status.toUpperCase(), MARGIN + 4, 34.5);

  // Generated date (top right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  rgb(doc, [180, 210, 240]);
  const genDate = `Generated ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`;
  doc.text(genDate, PAGE_W - MARGIN - doc.getTextWidth(genDate), 34.5);

  let y = 52;

  // ── Parties ────────────────────────────────────────────────────
  y = sectionHeading(doc, "Parties", y);

  // Two-column card: Client | Worker
  const cardH = 30;
  fill(doc, WHITE);
  stroke(doc, BORDER);
  doc.setLineWidth(0.3);
  roundRect(doc, MARGIN, y, COL_W / 2 - 2, cardH, 3, "FD");
  roundRect(doc, MARGIN + COL_W / 2 + 2, y, COL_W / 2 - 2, cardH, 3, "FD");

  // Client card
  fill(doc, BLUE_MID);
  roundRect(doc, MARGIN + 3, y + 4, 16, 6, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  rgb(doc, WHITE);
  doc.text("CLIENT", MARGIN + 5, y + 8.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  rgb(doc, GRAY_DARK);
  doc.text(
    `${agreement.client?.firstName} ${agreement.client?.lastName}`,
    MARGIN + 4,
    y + 18,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  rgb(doc, GRAY_MID);
  doc.text(agreement.client.email, MARGIN + 4, y + 24);

  // Worker card
  const wx = MARGIN + COL_W / 2 + 2;
  if (typeof agreement.worker !== "string") {
    fill(doc, BLUE_LIGHT);
    roundRect(doc, wx + 3, y + 4, 16, 6, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    rgb(doc, BLUE_MID);
    doc.text("WORKER", wx + 4.2, y + 8.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    rgb(doc, GRAY_DARK);
    doc.text(
      `${agreement.worker?.firstName} ${agreement.worker?.lastName}`,
      wx + 4,
      y + 18,
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    rgb(doc, GRAY_MID);
    doc.text(agreement.worker.email, wx + 4, y + 24);
  }

  y += cardH + 6;

  // ── Agreement Details ─────────────────────────────────────────
  y = sectionHeading(doc, "Agreement Details", y);

  const details = [
    ["Hourly Rate", `$${agreement.hourlyRate} / hr`],
    [
      "Start Date",
      new Date(agreement.startDate).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    ],
    ["Frequency", agreement.frequency],
    ["Terms Accepted", agreement.termsAcceptedByWorker ? "Yes" : "No"],
    ...(agreement.termsAcceptedAt
      ? [
          [
            "Terms Accepted At",
            new Date(agreement.termsAcceptedAt).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          ],
        ]
      : []),
  ] as [string, string][];

  fill(doc, WHITE);
  stroke(doc, BORDER);
  const detH = details.length * 7 + 2;
  roundRect(doc, MARGIN, y, COL_W, detH, 3, "FD");

  details.forEach(([k, v], i) => {
    kvRow(doc, k, v, y + 1 + i * 7, i % 2 === 1);
  });
  y += detH + 6;

  // ── Job Details ───────────────────────────────────────────────
  if (agreement.job) {
    y = checkPage(doc, y, 30);
    y = sectionHeading(doc, "Job Details", y);

    const jobRows: [string, string][] = [
      ["Title", agreement.job.title],
      ...(agreement.job.location
        ? [
            [
              "Location",
              `${agreement.job.location.line1}, ${agreement.job.location.state}`,
            ] as [string, string],
          ]
        : []),
    ];

    fill(doc, WHITE);
    stroke(doc, BORDER);
    const jH = jobRows.length * 7 + 2;
    roundRect(doc, MARGIN, y, COL_W, jH, 3, "FD");
    jobRows.forEach(([k, v], i) =>
      kvRow(doc, k, v, y + 1 + i * 7, i % 2 === 1),
    );
    y += jH + 6;
  }

  // ── Support Details ───────────────────────────────────────────
  if (agreement.job?.supportDetails?.length > 0) {
    y = checkPage(doc, y, 20);
    y = sectionHeading(doc, "Support Details", y);

    agreement.job.supportDetails.forEach((sd: any, i: number) => {
      y = checkPage(doc, y, 18);

      fill(doc, i % 2 === 0 ? WHITE : GRAY_LIGHT);
      stroke(doc, BORDER);
      roundRect(doc, MARGIN, y, COL_W, 16, 3, "FD");

      // Index badge
      fill(doc, BLUE_MID);
      roundRect(doc, MARGIN + 3, y + 3, 7, 7, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      rgb(doc, WHITE);
      doc.text(`${i + 1}`, MARGIN + 5, y + 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      rgb(doc, GRAY_DARK);
      doc.text(sd.name, MARGIN + 13, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      rgb(doc, GRAY_MID);
      const lines = doc.splitTextToSize(sd.description, COL_W - 16);
      doc.text(lines[0], MARGIN + 13, y + 12.5);

      y += 18;
    });

    y += 4;
  }

  // ── Schedule ──────────────────────────────────────────────────
  if (agreement.schedule?.length > 0) {
    y = checkPage(doc, y, 20);
    y = sectionHeading(doc, "Schedule", y);

    agreement.schedule.forEach((day: any, i: number) => {
      y = checkPage(doc, y, 10);
      const periods =
        day.period
          ?.map((p: any) => `${p.startTime} – ${p.endTime}`)
          .join("   ") || "—";

      if (i % 2 === 0) {
        fill(doc, GRAY_LIGHT);
        doc.rect(MARGIN, y, COL_W, 8, "F");
      }
      stroke(doc, BORDER);
      doc.setLineWidth(0.1);
      doc.rect(MARGIN, y, COL_W, 8, "D");

      // Day pill
      fill(doc, BLUE_DARK);
      roundRect(doc, MARGIN + 2, y + 1.5, 22, 5, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      rgb(doc, WHITE);
      doc.text(
        day.day.charAt(0).toUpperCase() + day.day.slice(1),
        MARGIN + 4,
        y + 5.4,
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      rgb(doc, GRAY_DARK);
      doc.text(periods, MARGIN + 28, y + 5.4);

      y += 8;
    });

    y += 6;
  }

  // ── Footer ────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    fill(doc, GRAY_LIGHT);
    doc.rect(0, PAGE_H - 14, PAGE_W, 14, "F");
    stroke(doc, BORDER);
    doc.setLineWidth(0.3);
    doc.line(0, PAGE_H - 14, PAGE_W, PAGE_H - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    rgb(doc, GRAY_MID);
    doc.text(`Agreement #${agreementId}  ·  Confidential`, MARGIN, PAGE_H - 6);
    doc.text(`Page ${p} of ${totalPages}`, PAGE_W - MARGIN - 14, PAGE_H - 6);
  }

  doc.save(`agreement-${agreementId}.pdf`);
};
