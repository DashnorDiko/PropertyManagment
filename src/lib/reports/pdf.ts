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
  drawText(`Periudha: ${periodLabel}`);
  drawText(`Gjeneruar: ${generatedAt.toISOString()}`);
  y -= 8;
  drawText(`Regjistra total: ${statistics.count}`);
  drawText(`Regjistra të paguar: ${statistics.paidCount}`);
  drawText(`Regjistra të papaguar: ${statistics.unpaidCount}`);
  y -= 8;
  drawText("Totale sipas monedhës", 14, rgb(0.1, 0.1, 0.4));
  drawText(`Totali EUR: ${statistics.totals.EUR.toFixed(2)}`);
  drawText(`Totali ALL: ${statistics.totals.ALL.toFixed(2)}`);
  y -= 8;
  drawText(`EUR të paguara: ${statistics.paidTotals.EUR.toFixed(2)}`);
  drawText(`ALL të paguara: ${statistics.paidTotals.ALL.toFixed(2)}`);
  drawText(`EUR të papaguara: ${statistics.unpaidTotals.EUR.toFixed(2)}`);
  drawText(`ALL të papaguara: ${statistics.unpaidTotals.ALL.toFixed(2)}`);

  return document.save();
}
