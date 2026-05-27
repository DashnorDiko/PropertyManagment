import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { ReportStatistics } from "../domain/statistics";

export interface PdfReportInput {
  title: string;
  periodLabel: string;
  generatedAt: Date;
  statistics: ReportStatistics;
}

export async function generateReportPdf({
  title,
  periodLabel,
  generatedAt,
  statistics,
}: PdfReportInput): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([595.28, 841.89]);
  const font = await document.embedFont(StandardFonts.Helvetica);

  let y = 790;
  const lineHeight = 20;

  const drawText = (text: string, size = 12, color = rgb(0, 0, 0)) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font,
      color,
    });
    y -= lineHeight;
  };

  drawText(title, 20, rgb(0.1, 0.1, 0.4));
  drawText(`Period: ${periodLabel}`);
  drawText(`Generated: ${generatedAt.toISOString()}`);
  y -= 8;
  drawText(`Total records: ${statistics.count}`);
  drawText(`Paid records: ${statistics.paidCount}`);
  drawText(`Unpaid records: ${statistics.unpaidCount}`);
  y -= 8;
  drawText("Totals by currency", 14, rgb(0.1, 0.1, 0.4));
  drawText(`EUR total: ${statistics.totals.EUR.toFixed(2)}`);
  drawText(`ALL total: ${statistics.totals.ALL.toFixed(2)}`);
  y -= 8;
  drawText(`EUR paid: ${statistics.paidTotals.EUR.toFixed(2)}`);
  drawText(`ALL paid: ${statistics.paidTotals.ALL.toFixed(2)}`);
  drawText(`EUR unpaid: ${statistics.unpaidTotals.EUR.toFixed(2)}`);
  drawText(`ALL unpaid: ${statistics.unpaidTotals.ALL.toFixed(2)}`);

  return document.save();
}
