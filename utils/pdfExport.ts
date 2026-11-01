import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFExportData {
  moduleName: string;
  subtitle?: string;
  userLoc?: { lat: number; lng: number };
  satelliteName?: string;
  satLongitude?: number;
  defcon?: number;
  isJamming?: boolean;
  jammingPower?: number;
  telemetry?: {
    snr: string;
    rxPower: string;
    bucTemp: string;
    packetLoss: string;
    status: string;
  };
  details?: Array<{ key: string; value: string }>;
  tables?: Array<{
    title?: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
  summaryText?: string;
}

export function exportModulePDF(data: PDFExportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const pageWidth = doc.internal.pageSize.getWidth();

  // Color Palette
  const darkNavy = [15, 23, 42]; // #0f172a
  const cyanPrimary = [6, 182, 212]; // #06b6d4
  const redAlert = [239, 68, 68]; // #ef4444
  const slateBorder = [51, 65, 85];

  // Top Classification Header
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Decorative Accent Line
  doc.setFillColor(data.isJamming ? redAlert[0] : cyanPrimary[0], data.isJamming ? redAlert[1] : cyanPrimary[1], data.isJamming ? redAlert[2] : cyanPrimary[2]);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('SATEXPERT TACTICAL SATCOM INTELLIGENCE (TSI)', 14, 12);

  doc.setFontSize(8);
  doc.setTextColor(data.isJamming ? redAlert[0] : cyanPrimary[0], data.isJamming ? redAlert[1] : cyanPrimary[1], data.isJamming ? redAlert[2] : cyanPrimary[2]);
  doc.text('CLASSIFICATION: TOP SECRET // NOFORN // COMBAT INTELLIGENCE', 14, 18);

  doc.setTextColor(148, 163, 184);
  doc.text(timestamp, pageWidth - 14, 18, { align: 'right' });

  // Report Title Block
  let yPos = 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(data.moduleName.toUpperCase() + ' REPORT', 14, yPos);

  if (data.subtitle) {
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(data.subtitle, 14, yPos);
  }

  yPos += 8;

  // Key Operational Telemetry Box
  doc.setLineWidth(0.3);
  doc.setDrawColor(slateBorder[0], slateBorder[1], slateBorder[2]);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('OPERATIONAL METRICS', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const locStr = data.userLoc ? `${data.userLoc.lat.toFixed(4)}°N, ${data.userLoc.lng.toFixed(4)}°W` : 'N/A';
  const satStr = data.satelliteName ? `${data.satelliteName} (${data.satLongitude ?? 0}°E)` : 'N/A';
  const defconStr = data.defcon ? `DEFCON ${data.defcon}` : 'DEFCON 5';
  const ewStr = data.isJamming ? `ACTIVE (${data.jammingPower}% POWER)` : 'INACTIVE';

  doc.text(`GRID POSITION: ${locStr}`, 18, yPos + 13);
  doc.text(`TARGET ASSET: ${satStr}`, 18, yPos + 19);

  doc.text(`THREAT LEVEL: ${defconStr}`, 110, yPos + 13);
  doc.text(`EW JAMMING: ${ewStr}`, 110, yPos + 19);

  if (data.telemetry) {
    doc.text(`SNR: ${data.telemetry.snr} dB  |  RX: ${data.telemetry.rxPower} dBm  |  LOSS: ${data.telemetry.packetLoss}%  |  STATUS: ${data.telemetry.status}`, 18, yPos + 24);
  }

  yPos += 34;

  // Details Section (Key-Value Grid)
  if (data.details && data.details.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('MODULE TELEMETRY & AUDIT SNAPSHOT', 14, yPos);
    yPos += 4;

    const detailRows = data.details.map(d => [d.key, d.value]);
    autoTable(doc, {
      startY: yPos,
      head: [['PARAMETER', 'VALUE / INTEL DATA']],
      body: detailRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Custom Tables
  if (data.tables && data.tables.length > 0) {
    data.tables.forEach(tbl => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      if (tbl.title) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(tbl.title.toUpperCase(), 14, yPos);
        yPos += 4;
      }

      autoTable(doc, {
        startY: yPos,
        head: [tbl.headers],
        body: tbl.rows,
        theme: 'striped',
        headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    });
  }

  // Summary / Narrative Text
  if (data.summaryText) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE TACTICAL ASSESSMENT', 14, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const splitText = doc.splitTextToSize(data.summaryText, pageWidth - 28);
    doc.text(splitText, 14, yPos);
    yPos += splitText.length * 4.5 + 8;
  }

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 282, pageWidth - 14, 282);

    doc.text(`CONFIDENTIAL - SATEXPERT TSI REPORT // MODULE: ${data.moduleName.toUpperCase()}`, 14, 287);
    doc.text(`PAGE ${i} OF ${totalPages}`, pageWidth - 14, 287, { align: 'right' });
  }

  const fileName = `${data.moduleName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report_${Date.now()}.pdf`;
  doc.save(fileName);
}
