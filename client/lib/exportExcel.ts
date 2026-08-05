import * as XLSX from "xlsx";

interface ExportExcelParams {
  filename: string;
  sheetName?: string;
  headers: string[];
  rows: (string | number)[][];
}

export function exportToExcel({ filename, sheetName = "Sheet1", headers, rows }: ExportExcelParams) {
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths auto
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    rows.forEach((row) => {
      const val = row[i]?.toString() || "";
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
