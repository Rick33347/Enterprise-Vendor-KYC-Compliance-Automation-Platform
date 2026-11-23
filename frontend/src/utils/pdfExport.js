import { jsPDF } from "jspdf";

export function exportReportToPDF(report) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 36, "F");
  doc.setTextColor(248, 250, 252);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Enterprise Vendor eKYC & Compliance Report", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  const timestamp = report.created_at
    ? new Date(report.created_at).toLocaleString()
    : new Date().toLocaleString();
  doc.text(`Generated: ${timestamp}`, 14, 28);

  y = 48;

  // Status & Score Summary
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("1. Compliance Verdict", 14, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Status: ${report.status.replace("_", " ")}`, 14, y);
  doc.text(`Compliance Score: ${report.compliance_score} / 100`, 100, y);
  y += 7;
  doc.text(`AI Extraction Confidence: ${report.extracted_data.confidence_score}%`, 14, y);
  if (report.filename) {
    doc.text(`Source File: ${report.filename}`, 100, y);
  }

  y += 14;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y - 5, pageWidth - 14, y - 5);

  // Extracted Metadata
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("2. Extracted Document Metadata", 14, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const orgLines = doc.splitTextToSize(
    `Organization: ${report.extracted_data.organization_name || "Not Identified"}`,
    pageWidth - 28
  );
  doc.text(orgLines, 14, y);
  y += orgLines.length * 6 + 2;

  doc.text(`Document Type: ${report.extracted_data.document_type}`, 14, y);
  y += 7;
  doc.text(
    `Important Dates: ${report.extracted_data.important_dates?.join(", ") || "None found"}`,
    14,
    y
  );

  y += 14;
  doc.line(14, y - 5, pageWidth - 14, y - 5);

  // Rule Engine Flags
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`3. Rule Engine Audit Flags (${report.flags.length})`, 14, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (report.flags.length === 0) {
    doc.setTextColor(22, 163, 74);
    doc.text("All deterministic compliance rules passed with zero flags.", 14, y);
  } else {
    report.flags.forEach((flag, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      doc.text(`${idx + 1}. [${flag.severity}] ${flag.rule_id}`, 14, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const msgLines = doc.splitTextToSize(flag.message, pageWidth - 32);
      doc.text(msgLines, 18, y);
      y += msgLines.length * 5 + 5;
    });
  }

  const safeName = (report.filename || "kyc_report").replace(/\.pdf$/i, "");
  doc.save(`${safeName}_compliance_report.pdf`);
}