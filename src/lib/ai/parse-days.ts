/**
 * Pure itinerary day-parser — shared by the route-saver (browser) and the
 * ai_routes backfill script (Node). Must stay dependency-free.
 */

export interface ParsedLocation {
  name: string;
  nameZh?: string;
  lat: number;
  lng: number;
  durationHours: number;
  bestTime: string;
  ticketPrice: string;
  highlights: string[];
  insiderTip?: string;
}

export interface ParsedDayPlan {
  day: number;
  theme: string;
  dailyCost: number;
  locations: ParsedLocation[];
  meals: { breakfast?: string; lunch?: string; dinner?: string };
  transport: string;
  accommodation?: string;
  notes?: string[];
}

const NUM = "[0-9一二三四五六七八九十百]{1,3}";
const DAY_HEADER_PATTERNS: RegExp[] = [
  new RegExp("^(?:day|día|dias|dia|jour|tag|dag|ngày|ngay|день|den)\\s*[:：.\-\u2013\u2014]?\\s*(" + NUM + ")", "i"),
  new RegExp("^第\\s*(" + NUM + ")\\s*(?:天|日)"),
  new RegExp("^(" + NUM + ")\\s*(?:日目|日間|일차|วัน|ngày|день)"),
  new RegExp("^(" + NUM + ")\\s*日(?!本)"),
  new RegExp("^(?:اليوم|يوم)\\s*(\\d+)"),
  new RegExp("^روز\\s*(\\d+)"),
  new RegExp("^(?:วันที่|วัน)\\s*(\\d+)"),
  new RegExp("^(" + NUM + ")\\s*[\-\u2013\u2014]?\\s*(?:day|jour|tag)", "i"),
];

/** Convert a Chinese/Japanese numeral (一, 十二, 二十一) to an integer. */
function numeralToInt(raw: string): number {
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  const map: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
  if (raw === "十") return 10;
  if (raw === "百") return 100;
  let total = 0;
  let section = 0;
  for (const ch of raw) {
    if (ch === "十") {
      total = (total || 1) * 10;
      section = 0;
    } else if (ch === "百") {
      total = (total || 1) * 100;
      section = 0;
    } else {
      section = map[ch] ?? 0;
      total += section;
    }
  }
  return total || section;
}

/** Strip leading hashes, asterisks and emoji/punctuation from a heading line. */
export function cleanHeaderLine(line: string): string {
  let s = line.trim();
  s = s.replace(/^#{1,6}\s*/, "");
  s = s.replace(/^\*+\s*/, "");
  s = s.replace(/^[\p{P}\p{S}\s]+/u, "");
  return s.trim();
}

function stripMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*/g, "")
    .trim();
}

function matchDayHeader(line: string): number | null {
  const cleaned = cleanHeaderLine(line);
  for (const re of DAY_HEADER_PATTERNS) {
    const m = cleaned.match(re);
    if (m?.[1]) {
      const n = numeralToInt(m[1]);
      if (Number.isFinite(n) && n > 0 && n < 100) return n;
    }
  }
  return null;
}

function extractTheme(headerLine: string): string {
  const cleaned = cleanHeaderLine(headerLine);
  const match = DAY_HEADER_PATTERNS.map((re) => cleaned.match(re)).find(Boolean);
  if (match) {
    const rest = cleaned.slice(match[0].length);
    return stripMarkdown(rest)
      .replace(/^[-*•·:：\s]+/, "")
      .replace(/[-*•·\s:：]+$/, "")
      .slice(0, 80);
  }
  return stripMarkdown(cleaned).slice(0, 80);
}

/** Split a markdown table row into trimmed cells ("" when not a row). */
function splitTableRow(line: string): string[] | null {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  const cells = t
    .split("|")
    .slice(1, -1)
    .map((c) => stripMarkdown(c.trim()));
  if (cells.every((c) => /^[-:]+$/.test(c))) return null; // separator row
  return cells;
}

const TIME_RE = /^(\d{1,2})[:：](\d{2})/;
const MEAL_RE =
  /早餐|午餐|晚餐|早饭|午饭|晚饭|breakfast|lunch|dinner|朝食|昼食|夕食|아침|점심|저녁|sáng|trưa|tối|завтрак|обе[дл]|ужин|petit[- ]déjeuner|déjeuner|dîner|frühstück|mittagessen|abendessen|الإفطار|الغداء|العشاء|صبحانه|ناهار|อาหารเช้า|อาหารกลางวัน|อาหารเย็น/i;
const TRANSPORT_RE =
  /交通|transport|metro|taxi|train|flight|high.?speed|乗り換え|地下鉄|電車|バス|タクシー|교통|지하철|di chuyển|tàu|máy bay|транспорт|метро|поезд|трансфер|métro|metro|zug|flug|bus|قطار|مترو|รถไฟ|แท็กซี่/i;
const HOTEL_RE = /酒店推荐|酒店|住宿|ホテル|호텔|khách sạn|отель|hôtel|hotel/i;

function assignMeal(cell: string, meals: ParsedDayPlan["meals"]): void {
  if (!cell) return;
  cell = cell.replace(/^[-*•·\s]+/, "").trim();
  if (/早餐|早饭|breakfast|朝食|아침|завтрак|petit[- ]déjeuner|frühstück|الإفطار|صبحانه|อาหารเช้า/i.test(cell)) meals.breakfast = cell;
  else if (/午餐|午饭|lunch|昼食|점심|обед|déjeuner|mittagessen|الغداء|ناهار|อาหารกลางวัน/i.test(cell)) meals.lunch = cell;
  else if (/晚餐|晚饭|dinner|夕食|저녁|ужин|dîner|abendessen|العشاء|شام|อาหารเย็น/i.test(cell)) meals.dinner = cell;
}

export function parseDailyPlansFromContent(content: string): ParsedDayPlan[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const days: { day: number; header: string; lines: string[] }[] = [];
  let current: { day: number; header: string; lines: string[] } | null = null;

  for (const line of lines) {
    const dayNum = matchDayHeader(line);
    if (dayNum !== null) {
      current = { day: dayNum, header: line, lines: [] };
      days.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  if (days.length === 0) return [];

  return days.map((d) => {
    const locations: ParsedLocation[] = [];
    const meals: ParsedDayPlan["meals"] = {};
    const transport: string[] = [];
    const notes: string[] = [];
    let accommodation: string | undefined;
    let inHotelTable = false;

    for (const line of d.lines) {
      const cells = splitTableRow(line);
      if (cells && cells.length >= 3) {
        const timeMatch = cells[0].match(TIME_RE);
        const isTableHeader = /^\s*(?:价位|类型|档位|等级|档次|tier|type|class|nivel|level|budget|价格)\s*$/i.test(cells[0]) || /^\s*(?:酒店名称|hotel|ホテル名|khách sạn|отель)\s*$/i.test(cells[1] || "");
        if (isTableHeader) {
          notes.push(line);
          continue;
        }
        if (timeMatch) {
          // Time | activity | place | cost  (or shifted columns)
          const activity = cells[1];
          const place = cells[2] || "";
          const cost = cells[3] || "";
          locations.push({
            name: stripMarkdown(activity).slice(0, 80) || stripMarkdown(place).slice(0, 80),
            lat: 0,
            lng: 0,
            durationHours: 1,
            bestTime: timeMatch[1] + ":" + timeMatch[2],
            ticketPrice: cost || "Free",
            highlights: [place, cost].filter(Boolean),
          });
          continue;
        }
        const isTransportRow =
          !timeMatch &&
          !/^\s*(?:路线|route|路程|行程|transport|交通方式|方式)\s*$/i.test(cells[0] || "") &&
          (cells[0]?.includes("→") || /地铁|公交|巴士|出租|taxi|metro|bus|train|flight|电铁|乘|徒步|步行|地铁线路|交通方式/.test(cells[0] + " " + (cells[1] || "")));
        if (isTransportRow) {
          transport.push(stripMarkdown(cells.join(" → ")));
          notes.push(line);
          continue;
        }
        if (inHotelTable && cells.length >= 2 && cells[1] && !accommodation) {
          // 3-tier hotel tables: 价位 | 酒店名 | 价格 | 地址 | 链接
          const name = cells[1];
          const price = cells[2] || "";
          accommodation = [name, price].filter(Boolean).join(" · ");
        }
        // meal/transport tables
        for (const cell of cells) {
          if (MEAL_RE.test(cell)) assignMeal(cell, meals);
        }
        notes.push(line);
        continue;
      }
      if (inHotelTable && line.trim()) {
        notes.push(line);
      }
      if (HOTEL_RE.test(line)) {
        inHotelTable = true;
        notes.push(line);
        continue;
      }
      inHotelTable = false;

      const urlMatch = line.match(/https?:\/\/[^\s)]+/g) || [];
      if (MEAL_RE.test(line)) {
        const clean = stripMarkdown(line);
        assignMeal(clean, meals);
        notes.push(line);
        continue;
      }
      if (TRANSPORT_RE.test(line)) {
        transport.push(stripMarkdown(line));
        notes.push(line);
        continue;
      }
      const isBullet = /^[-*•·\d.]+\s+/.test(line);
      if (isBullet && line.length > 2) {
        const name = stripMarkdown(cleanHeaderLine(line)).slice(0, 80) || "Activity";
        locations.push({
          name,
          lat: 0,
          lng: 0,
          durationHours: 1,
          bestTime: "",
          ticketPrice: "Free",
          highlights: urlMatch,
        });
      }
      notes.push(line);
    }

    return {
      day: d.day,
      theme: extractTheme(d.header),
      dailyCost: 0,
      locations,
      meals,
      transport: transport.join(" | "),
      ...(accommodation ? { accommodation } : {}),
      ...(notes.length ? { notes } : {}),
    };
  });
}
