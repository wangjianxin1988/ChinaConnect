/**
 * Invitation Letter Component with PDF Generation
 * Professional business invitation letter templates with download and print functionality
 */

import { INVITATION_TEMPLATES } from "@/data/guide/business/invitation-letter";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useState, useRef, useEffect } from "react";

interface FormValues {
  [key: string]: string;
}

function buildLetterHTML(template: (typeof INVITATION_TEMPLATES)[0], values: FormValues): string {
  let html = `<div class="print-container">`;

  // Header
  html += `<div class="print-header">
    <div class="print-title">${template.titleCn}</div>
    <div style="font-size:14pt;font-weight:normal;margin-top:5px;">${template.title}</div>
  </div>`;

  // Content sections
  for (const section of template.content.sections) {
    let content = section.content;
    for (const [key, val] of Object.entries(values)) {
      if (val.trim()) {
        content = content.replaceAll(`[${key.toUpperCase()}]`, val);
      } else {
        content = content.replaceAll(
          `[${key.toUpperCase()}]`,
          `<span style="color:#999;">【${key.replace(/_/g, " ")}】</span>`,
        );
      }
    }
    html += `<div class="print-section">
      <div class="print-section-title">${section.title}</div>
      <div>${content.replace(/\n/g, "<br>")}</div>
    </div>`;
  }

  // Closing
  const closing = template.content.closing
    .replaceAll(
      "[HOST_SIGNATURE]",
      values.host_signature || '<span style="color:#999;">【signature】</span>',
    )
    .replaceAll("[HOST_TITLE]", values.host_title || '<span style="color:#999;">【title】</span>')
    .replaceAll(
      "[HOST_COMPANY]",
      values.host_company || '<span style="color:#999;">【company】</span>',
    );
  html += `<div class="print-footer"><div></div><div class="print-signature">${closing.replace(/\n/g, "<br>")}</div></div>`;

  html += `</div>`;
  return html;
}

export function InvitationLetterClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(INVITATION_TEMPLATES[0].id);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [previewHTML, setPreviewHTML] = useState("");

  const currentTemplate =
    INVITATION_TEMPLATES.find((t) => t.id === selectedTemplate) || INVITATION_TEMPLATES[0];

  // Update preview when form values change
  useEffect(() => {
    if (previewMode && printRef.current) {
      const html = buildLetterHTML(currentTemplate, formValues);
      setPreviewHTML(html);
      printRef.current.innerHTML = html;
    }
  }, [formValues, previewMode, currentTemplate]);

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // Generate PDF
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    setIsGeneratingPDF(true);
    try {
      // Temporarily add the full HTML for better rendering
      const fullHTML = buildLetterHTML(currentTemplate, formValues);
      printRef.current.innerHTML = fullHTML;

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Handle page breaks for long documents
      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 297; // A4 page height in mm

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`invitation-letter-${currentTemplate.id}-${timestamp}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Download as text
  const handleDownloadTxt = () => {
    if (!printRef.current) return;

    const lines: string[] = [];

    lines.push(`${currentTemplate.titleCn}`);
    lines.push(currentTemplate.title);
    lines.push("");
    lines.push("─".repeat(50));
    lines.push("");

    for (const section of currentTemplate.content.sections) {
      let content = section.content;
      for (const [key, val] of Object.entries(formValues)) {
        if (val.trim()) {
          content = content.replaceAll(`[${key.toUpperCase()}]`, val);
        } else {
          content = content.replaceAll(`[${key.toUpperCase()}]`, `【${key.replace(/_/g, " ")}】`);
        }
      }
      lines.push(section.title);
      lines.push(content);
      lines.push("");
    }

    const closing = currentTemplate.content.closing
      .replaceAll("[HOST_SIGNATURE]", formValues.host_signature || "【signature】")
      .replaceAll("[HOST_TITLE]", formValues.host_title || "【title】")
      .replaceAll("[HOST_COMPANY]", formValues.host_company || "【company】");
    lines.push(closing);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invitation-letter-${currentTemplate.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print document
  const handlePrint = () => {
    if (!printRef.current) return;

    const fullHTML = buildLetterHTML(currentTemplate, formValues);
    printRef.current.innerHTML = fullHTML;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Business Invitation Letter</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Noto Sans SC', 'SimSun', sans-serif;
              font-size: 12pt;
              line-height: 1.8;
              color: #000;
            }
            .print-container {
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
            }
            .print-section {
              margin-bottom: 15px;
            }
            .print-section-title {
              font-weight: bold;
              margin-bottom: 8px;
            }
            .print-footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .print-signature {
              text-align: right;
            }
            @page { size: A4; margin: 15mm; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${fullHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <span className="text-5xl">✉️</span>
          <div>
            <h2 className="text-2xl font-bold mb-2">Business Invitation Letter Templates</h2>
            <p className="text-blue-100 max-w-2xl">
              Download ready-to-use invitation letters for visa applications, trade visits, and
              business meetings. Fill in the fields and download as PDF or print.
            </p>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Choose Template / 选择模板</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {INVITATION_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplate(tpl.id);
                setFormValues({});
                setPreviewMode(false);
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedTemplate === tpl.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">
                  {tpl.type === "formal" ? "📋" : tpl.type === "urgent" ? "⚡" : "📄"}
                </span>
                <div>
                  <div className="font-semibold">{tpl.title}</div>
                  <div className="text-xs text-muted-foreground">{tpl.titleCn}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{tpl.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    tpl.language === "bilingual"
                      ? "bg-blue-100 text-blue-700"
                      : tpl.language === "en"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {tpl.language === "bilingual"
                    ? "Bilingual / 双语"
                    : tpl.language === "en"
                      ? "English"
                      : "中文"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fill in Fields / 填写字段</h3>
            <button
              onClick={() => {
                setFormValues({});
                setPreviewMode(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          </div>

          <div className="bg-card rounded-xl border p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {currentTemplate.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  <span className="text-muted-foreground ml-2 text-xs">{field.labelCn}</span>
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={formValues[field.key] || ""}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Preview / 预览</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  previewMode
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {previewMode ? "Edit / 编辑" : "Preview / 预览"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download .txt
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
          </div>

          {/* Preview Container */}
          <div
            id="invitation-letter-preview"
            ref={printRef}
            className="bg-white border rounded-xl overflow-hidden"
          >
            {/* Preview content rendered here */}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <span>💡</span> Important Tips for Visa Applications / 签证申请重要提示
        </h4>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>
            • Include the company registration number (统一社会信用代码) — required by most
            embassies
          </li>
          <li>• Have the letter signed by an authorized person with company seal (公章)</li>
          <li>• Both English and Chinese versions are recommended for the Chinese embassy</li>
          <li>• Keep a scanned PDF copy and original for your visa interview</li>
        </ul>
        <p className="text-xs text-amber-600 mt-3">
          提示：大多数使领馆要求包含统一社会信用代码。邀请函须由授权签字人签字并加盖公司公章。
        </p>
      </div>
    </div>
  );
}

export default InvitationLetterClient;
