/**
 * PDF Generation Component for Business Invitation Letters
 * Uses html2canvas + jsPDF to generate professional PDF documents
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useRef } from "react";

interface UsePDFGenerationOptions {
  filename?: string;
  format?: "letter" | "a4";
  orientation?: "portrait" | "landscape";
}

interface PDFGeneratorReturn {
  generatePDF: (elementId: string) => Promise<void>;
  printDocument: (elementId: string) => void;
  isGenerating: boolean;
}

export function usePDFGeneration(options: UsePDFGenerationOptions = {}): PDFGeneratorReturn {
  const { filename = "invitation-letter", format = "a4", orientation = "portrait" } = options;
  const isGenerating = useRef(false);

  const generatePDF = useCallback(
    async (elementId: string) => {
      if (isGenerating.current) return;

      const element = document.getElementById(elementId);
      if (!element) {
        console.error("Element not found:", elementId);
        return;
      }

      isGenerating.current = true;

      try {
        // Configure html2canvas for high-quality rendering
        const canvas = await html2canvas(element, {
          scale: 2, // Higher resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        });

        // Calculate PDF dimensions
        const imgWidth = orientation === "landscape" ? 297 : 210; // A4 dimensions in mm
        const imgHeight = orientation === "landscape" ? 210 : 297;
        const ratio = canvas.width / canvas.height;
        const pdfWidth = ratio > imgWidth / imgHeight ? imgWidth : imgHeight * ratio;
        const pdfHeight = ratio > imgWidth / imgHeight ? imgWidth / ratio : imgHeight;

        // Create PDF
        const pdf = new jsPDF({
          orientation,
          unit: "mm",
          format,
        });

        // Add image to PDF
        const imgData = canvas.toDataURL("image/png");
        const xOffset = (imgWidth - pdfWidth) / 2;
        const yOffset = (imgHeight - pdfHeight) / 2;

        pdf.addImage(imgData, "PNG", xOffset, yOffset, pdfWidth, pdfHeight);

        // Save PDF
        const timestamp = new Date().toISOString().slice(0, 10);
        pdf.save(`${filename}-${timestamp}.pdf`);
      } catch (error) {
        console.error("PDF generation failed:", error);
        // Fallback to text download
        const textContent = element.innerText;
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } finally {
        isGenerating.current = false;
      }
    },
    [filename, format, orientation],
  );

  const printDocument = useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error("Element not found:", elementId);
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print");
        return;
      }

      // Write print-optimized HTML
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Noto Sans SC', 'SimSun', sans-serif;
              font-size: 12pt;
              line-height: 1.8;
              color: #000;
              padding: 20mm;
            }
            @media print {
              @page { size: ${orientation}; margin: 15mm; }
            }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    },
    [filename, orientation],
  );

  return {
    generatePDF,
    printDocument,
    get isGenerating() {
      return isGenerating.current;
    },
  };
}

/**
 * Print-optimized styles for invitation letters
 * Add this to your component for proper print layout
 */
export const printStyles = `
/* Print-optimized invitation letter styles */
.print-container {
  font-family: 'Noto Sans SC', 'SimSun', 'Noto Serif SC', serif;
  font-size: 12pt;
  line-height: 1.8;
  color: #000;
  background: #fff;
  padding: 20mm;
  max-width: 210mm;
  margin: 0 auto;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #000;
}

.print-title {
  font-size: 18pt;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.print-section {
  margin-bottom: 15px;
}

.print-section-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.print-field {
  display: flex;
  margin-bottom: 8px;
}

.print-field-label {
  width: 80px;
  font-weight: normal;
}

.print-field-value {
  flex: 1;
  border-bottom: 1px solid #ccc;
  padding-left: 10px;
}

.print-footer {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}

.print-signature {
  text-align: right;
}

@media print {
  body {
    padding: 0;
  }

  .no-print {
    display: none !important;
  }

  @page {
    size: a4 portrait;
    margin: 15mm;
  }
}
`;

/**
 * Helper to create print-optimized HTML content
 */
export function createPrintHTML(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invitation Letter</title>
        <style>
          ${printStyles}
        </style>
      </head>
      <body>
        <div class="print-container">
          ${content}
        </div>
      </body>
    </html>
  `;
}

export default usePDFGeneration;
