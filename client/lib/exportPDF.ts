import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportPDFParams {
  title: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

export function exportToPDF({ title, filename, headers, rows }: ExportPDFParams) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(10, 17, 40); // Trishul Navy #0A1128
  doc.rect(0, 0, 210, 24, "F");

  // Trishul Logo Accent & Title
  doc.setTextColor(242, 169, 59); // Trishul Amber #F2A93B
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TRISHUL CRM", 14, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(title, 120, 15);

  // Timestamp
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  const dateStr = `Generated on: ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  doc.text(dateStr, 14, 32);

  // Table
  autoTable(doc, {
    startY: 36,
    head: [headers],
    body: rows,
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [242, 169, 59],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  doc.save(`${filename}.pdf`);
}
