/**
 * TripView — public shared-itinerary view.
 * Resolves a share token to an ai_routes row (or a same-browser local route)
 * and renders the full ItineraryDisplay.
 */

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/supabase/config";
import { extractedRouteToSavedItinerary, routeRowToSavedItinerary } from "@/lib/ai/itinerary-builder";
import type { SavedItinerary } from "@/lib/ai/types";
import { ItineraryDisplay } from "@/components/ai/ItineraryDisplay";
import { downloadItineraryFile, type ExportLang } from "@/lib/ai/export-itinerary";
import { savedItineraryToExtractedRoute } from "@/lib/ai/itinerary-builder";
import { saveRoute } from "@/lib/ai/route-saver";
import { getCurrentUser } from "@/lib/auth/supabase-auth";
import { getLocalStorageManager } from "@/lib/ai/local-storage-manager";

const TRIP_LABELS: Record<string, { loading: string; notFound: string; notFoundDesc: string; cta: string; shared: string; plan: string; days: string }> = {
  en: { loading: "Loading itinerary…", notFound: "Itinerary not found", notFoundDesc: "This shared link is invalid or the itinerary has been deleted. Please ask the owner for a new link.", cta: "✨ Plan a new trip with ChinaGuide AI", shared: "Shared itinerary · chinaengage.org", plan: "✨ Plan your own trip with ChinaGuide AI", days: "day(s)" },
  ja: { loading: "行程を読み込み中…", notFound: "行程が見つかりません", notFoundDesc: "この共有リンクは無効か、行程が削除された可能性があります。所有者に新しいリンクを依頼してください。", cta: "✨ ChinaGuide AI で新しい旅行を計画", shared: "共有された行程 · chinaengage.org", plan: "✨ ChinaGuide AI で自分の旅行を計画", days: "日間" },
  ko: { loading: "일정을 불러오는 중…", notFound: "일정을 찾을 수 없습니다", notFoundDesc: "이 공유 링크가 유효하지 않거나 일정이 삭제되었습니다. 소유자에게 새 링크를 요청하세요.", cta: "✨ ChinaGuide AI로 새 여행 계획하기", shared: "공유된 일정 · chinaengage.org", plan: "✨ ChinaGuide AI로 나만의 여행 계획하기", days: "일" },
  "zh-CN": { loading: "正在加载行程…", notFound: "行程未找到", notFoundDesc: "此分享链接无效或行程已被删除，请联系所有者获取新链接。", cta: "✨ 用 ChinaGuide AI 规划新行程", shared: "分享的行程 · chinaengage.org", plan: "✨ 用 ChinaGuide AI 规划你的行程", days: "天" },
  "zh-TW": { loading: "正在載入行程…", notFound: "找不到行程", notFoundDesc: "此分享連結無效或行程已被刪除，請聯絡擁有者取得新連結。", cta: "✨ 使用 ChinaGuide AI 規劃新行程", shared: "分享的行程 · chinaengage.org", plan: "✨ 使用 ChinaGuide AI 規劃你的行程", days: "天" },
  th: { loading: "กำลังโหลดแผนการเดินทาง…", notFound: "ไม่พบแผนการเดินทาง", notFoundDesc: "ลิงก์นี้ไม่ถูกต้องหรือแผนการเดินทางถูกลบแล้ว กรุณาขอลิงก์ใหม่จากเจ้าของ", cta: "✨ วางแผนทริปใหม่กับ ChinaGuide AI", shared: "แผนการเดินทางที่แชร์ · chinaengage.org", plan: "✨ วางแผนทริปของคุณกับ ChinaGuide AI", days: "วัน" },
  vi: { loading: "Đang tải lịch trình…", notFound: "Không tìm thấy lịch trình", notFoundDesc: "Liên kết chia sẻ này không hợp lệ hoặc lịch trình đã bị xóa. Vui lòng yêu cầu chủ sở hữu cung cấp liên kết mới.", cta: "✨ Lên kế hoạch chuyến đi mới với ChinaGuide AI", shared: "Lịch trình được chia sẻ · chinaengage.org", plan: "✨ Lên kế hoạch chuyến đi của bạn với ChinaGuide AI", days: "ngày" },
  ru: { loading: "Загрузка маршрута…", notFound: "Маршрут не найден", notFoundDesc: "Эта ссылка недействительна или маршрут был удалён. Попросите владельца прислать новую ссылку.", cta: "✨ Спланируйте новую поездку с ChinaGuide AI", shared: "Общий маршрут · chinaengage.org", plan: "✨ Спланируйте свою поездку с ChinaGuide AI", days: "дн." },
  fr: { loading: "Chargement de l'itinéraire…", notFound: "Itinéraire introuvable", notFoundDesc: "Ce lien de partage est invalide ou l'itinéraire a été supprimé. Demandez un nouveau lien au propriétaire.", cta: "✨ Planifiez un nouveau voyage avec ChinaGuide AI", shared: "Itinéraire partagé · chinaengage.org", plan: "✨ Planifiez votre propre voyage avec ChinaGuide AI", days: "jour(s)" },
  de: { loading: "Reiseplan wird geladen…", notFound: "Reiseplan nicht gefunden", notFoundDesc: "Dieser Freigabelink ist ungültig oder der Reiseplan wurde entfernt. Bitte bitten Sie den Besitzer um einen neuen Link.", cta: "✨ Neue Reise mit ChinaGuide AI planen", shared: "Geteilter Reiseplan · chinaengage.org", plan: "✨ Eigene Reise mit ChinaGuide AI planen", days: "Tag(e)" },
  ar: { loading: "جارٍ تحميل خطة السفر…", notFound: "لم يتم العثور على الخطة", notFoundDesc: "رابط المشاركة هذا غير صالح أو تم حذف الخطة. يرجى طلب رابط جديد من المالك.", cta: "✨ خطط لرحلة جديدة مع ChinaGuide AI", shared: "خطة سفر مشتركة · chinaengage.org", plan: "✨ خطط لرحلتك الخاصة مع ChinaGuide AI", days: "أيام" },
  fa: { loading: "در حال بارگذاری برنامه سفر…", notFound: "برنامه سفر یافت نشد", notFoundDesc: "این لینک اشتراک‌گذاری نامعتبر است یا برنامه حذف شده است. لطفاً از مالک لینک جدیدی بخواهید.", cta: "✨ برنامه‌ریزی سفر جدید با ChinaGuide AI", shared: "برنامه سفر مشترک · chinaengage.org", plan: "✨ برنامه‌ریزی سفر خود با ChinaGuide AI", days: "روز" },
};

interface TripViewProps {
  token?: string;
}

type LoadState = "loading" | "ready" | "notfound";

const TRIP_ACTIONS: Record<string, { linkCopied: string; savedOk: string; saveFailed: string; shareTitle: string; copy: string; copied: string; close: string }> = {
  en: { linkCopied: "Link copied to clipboard", savedOk: "Saved to your account", saveFailed: "Save failed, please try again.", shareTitle: "Share itinerary", copy: "Copy link", copied: "Copied!", close: "Close" },
  "zh-CN": { linkCopied: "链接已复制到剪贴板", savedOk: "已保存到你的账户", saveFailed: "保存失败，请重试。", shareTitle: "分享行程", copy: "复制链接", copied: "已复制！", close: "关闭" },
  "zh-TW": { linkCopied: "連結已複製到剪貼簿", savedOk: "已儲存到你的帳戶", saveFailed: "儲存失敗，請重試。", shareTitle: "分享行程", copy: "複製連結", copied: "已複製！", close: "關閉" },
  ja: { linkCopied: "リンクをコピーしました", savedOk: "アカウントに保存しました", saveFailed: "保存に失敗しました。", shareTitle: "行程を共有", copy: "リンクをコピー", copied: "コピーしました！", close: "閉じる" },
  ko: { linkCopied: "링크가 복사되었습니다", savedOk: "계정에 저장되었습니다", saveFailed: "저장에 실패했습니다.", shareTitle: "일정 공유", copy: "링크 복사", copied: "복사됨!", close: "닫기" },
  th: { linkCopied: "คัดลอกลิงก์แล้ว", savedOk: "บันทึกไปยังบัญชีแล้ว", saveFailed: "บันทึกไม่สำเร็จ", shareTitle: "แชร์แผนการเดินทาง", copy: "คัดลอกลิงก์", copied: "คัดลอกแล้ว!", close: "ปิด" },
  vi: { linkCopied: "Đã sao chép liên kết", savedOk: "Đã lưu vào tài khoản", saveFailed: "Lưu thất bại", shareTitle: "Chia sẻ lịch trình", copy: "Sao chép liên kết", copied: "Đã sao chép!", close: "Đóng" },
  ru: { linkCopied: "Ссылка скопирована", savedOk: "Сохранено в аккаунт", saveFailed: "Не удалось сохранить", shareTitle: "Поделиться маршрутом", copy: "Копировать ссылку", copied: "Скопировано!", close: "Закрыть" },
  fr: { linkCopied: "Lien copié", savedOk: "Enregistré dans votre compte", saveFailed: "Échec de l’enregistrement", shareTitle: "Partager l’itinéraire", copy: "Copier le lien", copied: "Copié !", close: "Fermer" },
  de: { linkCopied: "Link kopiert", savedOk: "In Ihrem Konto gespeichert", saveFailed: "Speichern fehlgeschlagen", shareTitle: "Reiseplan teilen", copy: "Link kopieren", copied: "Kopiert!", close: "Schließen" },
  ar: { linkCopied: "تم نسخ الرابط", savedOk: "تم الحفظ في حسابك", saveFailed: "فشل الحفظ", shareTitle: "مشاركة الخطة", copy: "نسخ الرابط", copied: "تم النسخ!", close: "إغلاق" },
  fa: { linkCopied: "لینک کپی شد", savedOk: "در حساب شما ذخیره شد", saveFailed: "ذخیره ناموفق بود", shareTitle: "اشتراک‌گذاری برنامه", copy: "کپی لینک", copied: "کپی شد!", close: "بستن" },
};

const TRIP_LOCALES = new Set([
  "en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa",
]);

function resolveToken(tokenProp?: string): string {
  if (tokenProp) return tokenProp;
  if (typeof window === "undefined") return "";
  const fromQuery = new URLSearchParams(window.location.search).get("token");
  if (fromQuery) return fromQuery;
  const segs = window.location.pathname.split("/").filter(Boolean);
  // /trip/<token> or /<locale>/trip/<token>
  if (segs[0] === "trip") return segs[1] || "";
  if (TRIP_LOCALES.has(segs[0]) && segs[1] === "trip") return segs[2] || "";
  return "";
}


/** Copy text to clipboard with a permission-less fallback so the button works
 *  even where navigator.clipboard is blocked (http/iframe/older browsers). */
const copyTextToClipboard = (text: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => fallbackCopy(text),
    );
  }
  return Promise.resolve(fallbackCopy(text));
};

const fallbackCopy = (text: string): boolean => {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

export function TripView({ token: tokenProp }: TripViewProps) {
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [lang, setLang] = useState<string>(() => detectLang());
  const [state, setState] = useState<LoadState>("loading");
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const TA = TRIP_ACTIONS[lang] || TRIP_ACTIONS.en;

  const handleExport = useCallback(
    async (format: "text" | "json" | "pdf") => {
      if (!itinerary) return;
      await downloadItineraryFile(itinerary, lang as ExportLang, format);
    },
    [itinerary, lang],
  );

  const handleShare = useCallback(() => {
    setShowShare(true);
    setCopied(false);
  }, []);

  const handleCopyShare = useCallback(() => {
    const url = window.location.href;
    copyTextToClipboard(url).then((ok) => {
      if (ok) setCopied(true);
      else alert(url);
    });
  }, []);

  const handleSave = useCallback(async (name: string) => {
    if (!itinerary) return;
    const user = await getCurrentUser();
    if (!user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?next=${next}`;
      return;
    }
    try {
      const route = savedItineraryToExtractedRoute({ ...itinerary, name });
      const result = await saveRoute(user.id, "", route);
      if (result.success && result.routeId) {
        alert(TA.savedOk);
      } else {
        alert(TA.saveFailed);
      }
    } catch (err) {
      console.error("save shared itinerary failed", err);
      alert(TA.saveFailed);
    }
  }, [itinerary, TA.savedOk, TA.saveFailed]);


  useEffect(() => {
    let cancelled = false;
    const token = resolveToken(tokenProp);
    if (!token) {
      setState("notfound");
      return;
    }
    (async () => {
      // Bind localStorage to the signed-in user so share lookups never
      // cross accounts on the same browser.
      try {
        const user = await getCurrentUser();
        getLocalStorageManager(user?.id ?? null);
      } catch {
        getLocalStorageManager(null);
      }
      if (cancelled) return;

      // 1. Same-browser local routes (offline / not-yet-synced shares)
      try {
        const lsm = getLocalStorageManager();
        const index = lsm.loadShareIndex();
        const localId = index[token];
        if (localId) {
          const route = lsm.loadSavedRoutes().find((r) => r.id === localId);
          if (route) {
            const it = extractedRouteToSavedItinerary(route as never, lang);
            if (typeof route.createdAt === "string") it.createdAt = route.createdAt;
            if (!cancelled) {
              setItinerary(it);
              setState("ready");
            }
            return;
          }
        }
      } catch {
        // fall through to Supabase
      }

      // 2. Server-side public share (anon key, RLS allows is_public=true rows)
      try {
        const { data, error } = await supabase
          .from("ai_routes")
          .select(
            "id, title, title_zh, summary, summary_zh, days, route_data, created_at, updated_at",
          )
          .eq("share_token", token)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setState("notfound");
          return;
        }
        setItinerary(routeRowToSavedItinerary(data as never, lang));
        setState("ready");
      } catch {
        if (!cancelled) setState("notfound");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenProp]);

  if (state === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          {/* label */}<p className="text-gray-500 text-sm">{TRIP_LABELS[lang]?.loading || TRIP_LABELS.en.loading}</p>
        </div>
      </div>
    );
  }

  if (state === "notfound" || !itinerary) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{TRIP_LABELS[lang]?.notFound || TRIP_LABELS.en.notFound}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {TRIP_LABELS[lang]?.notFoundDesc || TRIP_LABELS.en.notFoundDesc}
          </p>
          <a href="/ai" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
            {TRIP_LABELS[lang]?.cta || TRIP_LABELS.en.cta}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[60vh]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-5">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
            {TRIP_LABELS[lang]?.shared || TRIP_LABELS.en.shared}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{itinerary.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {itinerary.destination || "China"} · {itinerary.days} {TRIP_LABELS[lang]?.days || "day(s)"}
          </p>
        </div>
        <ItineraryDisplay
          itinerary={itinerary}
          language={lang as never}
          onSave={handleSave}
          onExport={handleExport}
          onShare={handleShare}
        />
        <div className="mt-8 text-center">
          <a
            href="/ai"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {TRIP_LABELS[lang]?.plan || TRIP_LABELS.en.plan}
          </a>
        </div>
      </div>

      {/* Share dialog */}
      {showShare && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[26rem] shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-1">{TA.shareTitle}</h3>
            <p className="text-xs text-gray-500 mb-3">chinaengage.org</p>
            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none"
              />
              <button
                onClick={handleCopyShare}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
              >
                {copied ? TA.copied : TA.copy}
              </button>
            </div>
            <button
              onClick={() => setShowShare(false)}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {TA.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function detectLang(): string {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem("chinaconnect_language");
    if (stored && TRIP_LABELS[stored]) return stored;
  } catch {
    // ignore
  }
  const html = document.documentElement.lang;
  if (html && TRIP_LABELS[html]) return html;
  const nav = navigator.language || "en";
  if (TRIP_LABELS[nav]) return nav;
  const prefix = nav.split("-")[0];
  for (const key of Object.keys(TRIP_LABELS)) {
    if (key.toLowerCase().startsWith(prefix)) return key;
  }
  return "en";
}

export default TripView;
