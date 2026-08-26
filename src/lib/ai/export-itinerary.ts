/**
 * Shared itinerary export helpers (PDF / text / JSON) for the AI chat,
 * saved-itinerary detail page and public share page. Documents always use
 * the viewer's UI language via EXPORT_LABELS.
 */

import type { SavedItinerary } from "./types";
import { EXPORT_LABELS, type ExportLang } from "./export-labels";

export type { ExportLang };

const escHtml = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function urlize(text: string): string {
  return escHtml(text).replace(
    /(https?:\/\/[^\s)]+)/g,
    '<a href="$1" style="color:#2563eb;word-break:break-all;">$1</a>',
  );
}

/** Clean a single line of markdown-ish text (used on structured fields). */
const cleanInline = (v: unknown): string =>
  String(v ?? "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*/g, "")
    .trim();

/** Convert raw markdown-ish AI plan text into readable plain text for
 *  text/PDF exports (strip markers, headings, tables, links keep URL). */
export function markdownToPlain(raw: string): string {
  return String(raw ?? "")
    .split(/\r?\n/)
    .map((line) => {
      let l = line.trim();
      if (!l) return "";
      // tables -> pipe-joined cells
      if (l.startsWith("|")) {
        const cells = l
          .split("|")
          .slice(1, -1)
          .map((c) =>
            c
              .trim()
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
              .replace(/\*\*([^*]+)\*\*/g, "$1")
              .replace(/\*([^*]+)\*/g, "$1")
              .replace(/`([^`]+)`/g, "$1"),
          )
          .filter((c) => c && !/^[-:]+$/.test(c));
        return cells.length ? cells.join("  |  ") : "";
      }
      // headings -> strip leading #s
      l = l.replace(/^#{1,6}\s*/, "");
      // horizontal rules
      if (/^([-*_])\1{2,}$/.test(l)) return "";
      // list markers -> bullet
      l = l.replace(/^[-*•·]\s+/, "• ").replace(/^\d+[.、)]\s+/, "");
      // inline markdown links -> text (url)
      l = l.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
      // bold/italic/code markers
      l = l.replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*/g, "");
      return l;
    })
    .filter(Boolean)
    .join("\n");
}

function slugify(name: string): string {
  const s = (name || "itinerary")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "itinerary";
}

/** Rich plain-text version of a saved itinerary (multilingual headings). */
export function itineraryToText(it: SavedItinerary, lang: ExportLang = "en"): string {
  const L = EXPORT_LABELS[lang] || EXPORT_LABELS.en;
  const lines: string[] = [];
  lines.push(`# ${it.name}`);
  lines.push(`${L.dest}: ${it.destination || ""}`);
  lines.push(`${L.tripLength}: ${it.days} ${L.days}`);
  lines.push("");
  const s = it.data?.summary;
  if (s) {
    if (s.topHighlights?.length) {
      lines.push(`## ${L.highlights}`);
      s.topHighlights.forEach((h) => lines.push(`- ${cleanInline(h)}`));
      lines.push("");
    }
    if (s.estimatedTotalCost) {
      lines.push(
        `## ${L.cost}: ${s.currency === "CNY" ? "¥" : s.currency + " "}${s.estimatedTotalCost}`,
      );
      lines.push("");
    }
    if (s.travelTips?.length) {
      lines.push(`## ${L.tips}`);
      s.travelTips.forEach((t) => lines.push(`- ${cleanInline(t)}`));
      lines.push("");
    }
  }
  const daily = it.data?.dailyItinerary || [];
  if (daily.length) {
    lines.push(`## ${L.daily}`);
    daily.forEach((day) => {
      lines.push("");
      lines.push(`### ${L.day} ${day.day}${day.theme ? " — " + cleanInline(day.theme) : ""}`);
      if (day.transportToAttractions?.route) {
        lines.push(`${L.transport}: ${day.transportToAttractions.route}`);
      }
      (day.locations || []).forEach((loc) => {
        const time =
          loc.bestTimeStart || loc.bestTimeEnd
            ? ` [${[loc.bestTimeStart, loc.bestTimeEnd].filter(Boolean).join(" - ")}]`
            : "";
        const dur = loc.durationHours ? ` (${loc.durationHours}${L.duration})` : "";
        const price = loc.ticketInfo?.price ? ` — ${loc.ticketInfo.price}` : "";
        lines.push(`- ${cleanInline(loc.name)}${time}${dur}${price}`);
        (loc.highlights || []).slice(0, 3).forEach((h) => lines.push(`   - ${cleanInline(h)}`));
        if (loc.insiderTip) lines.push(`   💡 ${cleanInline(loc.insiderTip)}`);
        if (loc.ticketInfo?.bookingUrl) lines.push(`   🔗 ${loc.ticketInfo.bookingUrl}`);
      });
      const meals = [day.meals?.breakfast, day.meals?.lunch, day.meals?.dinner].filter(
        Boolean,
      ) as Array<{ name?: string }>;
      if (meals.length) {
        lines.push(`${L.meals}: ${meals.map((m) => cleanInline(m.name || "")).filter(Boolean).join("  |  ")}`);
      }
      if (day.accommodation?.name) {
        lines.push(`${L.accommodation}: ${cleanInline(day.accommodation.name)}`);
      }
      if (day.notes?.length) {
        day.notes.slice(0, 12).forEach((n) => lines.push(`  - ${cleanInline(n)}`));
      }
    });
  }
  if (it.data?.rawPlan) {
    lines.push("");
    lines.push(`## ${L.originalPlan}`);
    lines.push(markdownToPlain(it.data.rawPlan));
  }
  lines.push("");
  lines.push(L.generated);
  return lines.join("\n");
}

/** Build a printable HTML snapshot (used for PDF export). */
export function buildExportHtml(it: SavedItinerary, lang: ExportLang): string {
  const L = EXPORT_LABELS[lang] || EXPORT_LABELS.en;
  const isRtl = lang === "ar" || lang === "fa";
  const s = it.data?.summary;
  const daily = it.data?.dailyItinerary || [];
  const parts: string[] = [];
  const bodyStyle = `font-family:-apple-system,'PingFang SC','Microsoft YaHei','Noto Sans SC','Noto Sans Thai','Noto Sans Arabic','Noto Sans JP','Noto Sans KR','Segoe UI',sans-serif;color:#1f2937;max-width:720px;margin:0 auto;direction:${isRtl ? "rtl" : "ltr"};text-align:${isRtl ? "right" : "left"}`;
  parts.push(`<div style="${bodyStyle}">`);

  // Header
  parts.push(
    `<div style="background:linear-gradient(135deg,#1d4ed8,#6d28d9);color:#fff;border-radius:16px;padding:28px 30px;margin-bottom:22px;">` +
      `<div style="font-size:11px;letter-spacing:2px;opacity:.8;text-transform:uppercase;">ChinaGuide AI · ${escHtml(L.title)}</div>` +
      `<div style="font-size:27px;font-weight:800;margin:6px 0 8px;line-height:1.25;">${escHtml(it.name)}</div>` +
      `<div style="font-size:13px;opacity:.9;">${escHtml(L.dest)}: ${escHtml(it.destination || "-")} &nbsp;·&nbsp; ${escHtml(String(it.days))} ${escHtml(L.days)}</div>` +
      `</div>`,
  );

  const section = (icon: string, title: string, inner: string) =>
    `<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;page-break-inside:avoid;">` +
    `<div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#111827;">${icon} ${escHtml(title)}</div>${inner}</div>`;

  if (s) {
    if (s.topHighlights && s.topHighlights.length) {
      parts.push(
        section(
          "⭐",
          L.highlights,
          s.topHighlights
            .slice(0, 10)
            .map((h) => `<div style="font-size:13px;padding:3px 0;line-height:1.5;">• ${urlize(h)}</div>`)
            .join(""),
        ),
      );
    }
    if (s.estimatedTotalCost) {
      parts.push(
        section(
          "💰",
          L.cost,
          `<div style="font-size:20px;font-weight:800;color:#059669;">${
            s.currency === "CNY" ? "¥" : s.currency + " "
          }${escHtml(s.estimatedTotalCost)}</div>`,
        ),
      );
    }
    if (s.travelTips && s.travelTips.length) {
      parts.push(
        section(
          "💡",
          L.tips,
          s.travelTips
            .slice(0, 10)
            .map((tip) => `<div style="font-size:13px;padding:3px 0;line-height:1.5;">• ${urlize(tip)}</div>`)
            .join(""),
        ),
      );
    }
  }

  if (daily.length) {
    parts.push(`<div style="font-weight:800;font-size:16px;margin:20px 0 10px;color:#111827;">🗓 ${escHtml(L.daily)}</div>`);
    daily.forEach((day) => {
      const rows: string[] = [];
      rows.push(
        `<div style="font-weight:700;font-size:15px;color:#1d4ed8;margin-bottom:8px;">${escHtml(L.day)} ${escHtml(String(day.day))}${day.theme ? " — " + escHtml(day.theme) : ""}</div>`,
      );
      if (day.transportToAttractions?.route) {
        rows.push(
          `<div style="font-size:12px;color:#374151;margin-bottom:6px;background:#f3f4f6;border-radius:8px;padding:6px 10px;">🚇 ${escHtml(L.transport)}: ${escHtml(day.transportToAttractions.route)}</div>`,
        );
      }
      (day.locations || []).forEach((loc, i) => {
        const time =
          loc.bestTimeStart || loc.bestTimeEnd
            ? ` [${[loc.bestTimeStart, loc.bestTimeEnd].filter(Boolean).join(" - ")}]`
            : "";
        const dur = loc.durationHours ? ` (${escHtml(loc.durationHours)}${escHtml(L.duration)})` : "";
        const price = loc.ticketInfo?.price ? ` — ${escHtml(loc.ticketInfo.price)}` : "";
        rows.push(
          `<div style="font-size:13px;margin:6px 0 2px;line-height:1.5;"><b>${i + 1}. ${escHtml(cleanInline(loc.name))}</b>${escHtml(time)}${dur}${price}</div>`,
        );
        (loc.highlights || []).slice(0, 3).forEach((h) =>
          rows.push(`<div style="font-size:12px;color:#6b7280;padding-left:16px;line-height:1.5;">• ${urlize(cleanInline(h))}</div>`),
        );
        if (loc.insiderTip)
          rows.push(`<div style="font-size:12px;color:#b45309;padding-left:16px;">💡 ${urlize(cleanInline(loc.insiderTip))}</div>`);
        if (loc.ticketInfo?.bookingUrl)
          rows.push(`<div style="font-size:12px;color:#2563eb;padding-left:16px;">🔗 ${urlize(loc.ticketInfo.bookingUrl)}</div>`);
      });
      const meals = [day.meals?.breakfast, day.meals?.lunch, day.meals?.dinner].filter(
        Boolean,
      ) as Array<{ name?: string }>;
      if (meals.length) {
        rows.push(
          `<div style="font-size:12px;color:#374151;margin-top:6px;background:#fef3c7;border-radius:8px;padding:6px 10px;">🍜 ${escHtml(L.meals)}: ${escHtml(meals.map((m) => cleanInline(m.name || "")).filter(Boolean).join("  |  "))}</div>`,
        );
      }
      if (day.accommodation?.name) {
        rows.push(
          `<div style="font-size:12px;color:#374151;margin-top:4px;background:#e0f2fe;border-radius:8px;padding:6px 10px;">🏨 ${escHtml(L.accommodation)}: ${escHtml(cleanInline(day.accommodation.name))}${day.accommodation.location ? " — " + escHtml(cleanInline(day.accommodation.location)) : ""}</div>`,
        );
      }
      if (day.notes && day.notes.length) {
        rows.push(`<div style="font-size:12px;color:#6b7280;margin-top:6px;">📋 ${escHtml(L.notes)}:</div>`);
        day.notes.slice(0, 10).forEach((n) =>
          rows.push(`<div style="font-size:12px;color:#6b7280;padding-left:12px;line-height:1.5;">• ${urlize(n)}</div>`),
        );
      }
      parts.push(
        `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin-bottom:12px;page-break-inside:avoid;">${rows.join("")}</div>`,
      );
    });
  }

  if (it.data?.rawPlan) {
    const planText = markdownToPlain(it.data.rawPlan).slice(0, 2200);
    parts.push(
      `<div style="font-weight:700;font-size:15px;margin:18px 0 8px;">📄 ${escHtml(L.originalPlan)}</div>` +
        `<div style="font-size:12px;color:#4b5563;white-space:pre-wrap;line-height:1.6;">${urlize(planText)}${planText.length >= 2200 ? " …" : ""}</div>`,
    );
  }
  parts.push(
    `<div style="font-size:11px;color:#9ca3af;margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;">${escHtml(L.generated)}</div>`,
  );
  parts.push("</div>");
  return parts.join("");
}

/**
 * Download the itinerary as a file. Returns the filename, or null on error.
 * PDF is rasterized from the printable HTML (jspdf + html2canvas) so the
 * layout is identical across languages, including RTL.
 */
export async function downloadItineraryFile(
  it: SavedItinerary,
  lang: ExportLang,
  format: "pdf" | "text" | "json",
): Promise<string | null> {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const base = `chinaconnect-${slugify(it.name)}-${lang}-${stamp}`;
  try {
    if (format === "pdf") {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const html2canvas = html2canvasModule.default || html2canvasModule;
      // Raster-based PDF: html2canvas renders in the browser (correct CJK and
      // RTL glyphs) and each page slice is embedded as an image. jsPDF's
      // own html() uses its context2d shim which emits base-14-font text
      // layers — those cannot encode Chinese/Japanese/Arabic and produce the
      // garbled documents users reported.
      const host = document.createElement("div");
      host.id = "cc-pdf-export-host";
      host.style.position = "fixed";
      host.style.left = "0";
      host.style.top = "0";
      host.style.zIndex = "-1";
      host.style.width = "794px";
      host.style.background = "#ffffff";
      const root = document.createElement("div");
      root.id = "cc-pdf-export-root";
      root.style.width = "794px";
      root.style.background = "#ffffff";
      root.innerHTML = buildExportHtml(it, lang);
      host.appendChild(root);
      document.body.appendChild(host);

      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 32;
      const contentW = pageW - margin * 2; // 531.28pt
      const contentH = pageH - margin * 2; // 777.89pt
      const pxPerPt = 96 / 72;
      const pageWpx = Math.round(contentW * pxPerPt); // ~708px
      const pageHpx = Math.round(contentH * pxPerPt); // ~1037px

      // The export HTML is wrapped in one outer div (max-width:720px), so the
      // real page-building blocks are its children. Split them at block
      // boundaries so day cards / sections are never cut mid-way (mirrors the
      // page-break-inside:avoid rules in the HTML).
      const wrapper = (root.firstElementChild || root) as HTMLElement;
      // Force a synchronous layout so block heights are real before paginating.
      void root.offsetHeight;
      void wrapper.offsetHeight;
      const blocks = Array.from(wrapper.children) as HTMLElement[];
      const pages: HTMLElement[][] = [];
      let cur: HTMLElement[] = [];
      let curH = 0;
      for (const b of blocks) {
        const h = (b as HTMLElement).offsetHeight || 60;
        if (cur.length && curH + h > pageHpx + 40) {
          pages.push(cur);
          cur = [];
          curH = 0;
        }
        cur.push(b);
        curH += h;
      }
      if (cur.length) pages.push(cur);

      // Defensive re-split: if a block group is still taller than one page
      // (e.g. a very long day), break it into smaller consecutive chunks.
      const finalPages: Array<{ blocks: HTMLElement[]; offset: number }> = [];
      for (const group of pages) {
        const groupH = group.reduce((a, b) => a + ((b as HTMLElement).offsetHeight || 60), 0);
        if (groupH <= pageHpx + 40) {
          finalPages.push({ blocks: group, offset: 0 });
          continue;
        }
        // Split between blocks first…
        const chunks: HTMLElement[][] = [];
        let chunk: HTMLElement[] = [];
        let chunkH = 0;
        for (const b of group) {
          const h = (b as HTMLElement).offsetHeight || 60;
          if (chunk.length && chunkH + h > pageHpx + 40) {
            chunks.push(chunk);
            chunk = [];
            chunkH = 0;
          }
          chunk.push(b);
          chunkH += h;
        }
        if (chunk.length) chunks.push(chunk);
        // …then window-slice any chunk whose single block is still too tall.
        for (const c of chunks) {
          const cH = c.reduce((a, b) => a + ((b as HTMLElement).offsetHeight || 60), 0);
          if (cH <= pageHpx + 40) {
            finalPages.push({ blocks: c, offset: 0 });
          } else {
            const n = Math.ceil(cH / pageHpx);
            for (let k = 0; k < n; k++) {
              finalPages.push({ blocks: c, offset: k * pageHpx });
            }
          }
        }
      }

      // Merge a tiny trailing page into the previous one so users never get a
      // near-empty sliver (the few extra pixels still fit on the physical A4).
      while (finalPages.length > 1) {
        const last = finalPages[finalPages.length - 1];
        if (last.offset === 0 && last.blocks.reduce((a, b) => a + ((b as HTMLElement).offsetHeight || 60), 0) < 60) {
          const prev = finalPages[finalPages.length - 2];
          prev.blocks.push(...last.blocks);
          finalPages.pop();
        } else {
          break;
        }
      }

      for (let pageIndex = 0; pageIndex < finalPages.length; pageIndex++) {
        const { blocks: pageBlocks, offset } = finalPages[pageIndex];
        const pageDiv = document.createElement("div");
        pageDiv.style.cssText = `width:${pageWpx}px;background:#ffffff;`;
        pageDiv.style.position = "relative";
        if (offset > 0) {
          // Window slice: clip a tall group to one viewport-sized chunk.
          pageDiv.style.height = `${pageHpx}px`;
          pageDiv.style.overflow = "hidden";
          const inner = document.createElement("div");
          inner.style.width = `${pageWpx}px`;
          inner.style.marginTop = `-${offset}px`;
          pageBlocks.forEach((b) => inner.appendChild(b));
          pageDiv.appendChild(inner);
        } else {
          pageBlocks.forEach((b) => pageDiv.appendChild(b));
        }
        host.appendChild(pageDiv);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))),
        );
        try {
          const canvas = await html2canvas(pageDiv, {
            backgroundColor: "#ffffff",
            useCORS: true,
            logging: false,
            windowWidth: 794,
            scale: 2,
          });
          const img = canvas.toDataURL("image/png");
          const imgH = (canvas.height / canvas.width) * contentW;
          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(img, "PNG", margin, margin, contentW, imgH, undefined, "FAST");
        } finally {
          host.removeChild(pageDiv);
          // move blocks back so the next page can pick them up
          pageBlocks.forEach((b) => wrapper.appendChild(b));
        }
      }
      document.body.removeChild(host);
      pdf.save(`${base}.pdf`);
      return `${base}.pdf`;
    }
    const content =
      format === "json" ? JSON.stringify(it, null, 2) : itineraryToText(it, lang);
    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.${format === "json" ? "json" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return a.download;
  } catch (err) {
    console.error("Export failed:", err);
    return null;
  }
}
