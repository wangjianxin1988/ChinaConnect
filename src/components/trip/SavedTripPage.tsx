/**
 * SavedTripPage — full-width detail view for a user's own saved itinerary
 * (/itinerary/<id> and /<locale>/itinerary/<id>). Requires sign-in; loads the
 * ai_routes row via RLS and renders ItineraryDisplay with working
 * save/rename, export (PDF/text/JSON), share and delete actions.
 */

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/supabase/config";
import { routeRowToSavedItinerary } from "@/lib/ai/itinerary-builder";
import type { SavedItinerary } from "@/lib/ai/types";
import { ItineraryDisplay } from "@/components/ai/ItineraryDisplay";
import { downloadItineraryFile, type ExportLang } from "@/lib/ai/export-itinerary";
import { getCurrentUser } from "@/lib/auth/supabase-auth";
import { getCurrentTier } from "@/lib/subscription";
import { fetchUsageFromServer } from "@/lib/usage-tracker";

const PAGE_LABELS: Record<
  string,
  {
    loading: string;
    notFound: string;
    notFoundDesc: string;
    signInTitle: string;
    signInDesc: string;
    signInCta: string;
    backToAi: string;
    saved: string;
    shareTitle: string;
    copy: string;
    copied: string;
    close: string;
    downloadTitle: string;
    renameTitle: string;
    renamePlaceholder: string;
    cancel: string;
    confirm: string;
    deleteConfirm: string;
    deleteFailed: string;
    shareFailed: string;
    exportFailed: string;
    pdfRestricted: string;
  }
> = {
  en: {
    loading: "Loading itinerary…", notFound: "Itinerary not found", notFoundDesc: "This itinerary is private or was deleted.",
    signInTitle: "Sign in to view your saved itinerary", signInDesc: "Your saved trips are private to your account.",
    signInCta: "Sign in", backToAi: "Back to AI chat", saved: "Saved", shareTitle: "Share itinerary",
    copy: "Copy link", copied: "Copied!", close: "Close", downloadTitle: "Download",
    renameTitle: "Save itinerary", renamePlaceholder: "Itinerary name", cancel: "Cancel", confirm: "Save",
    deleteConfirm: "Delete this itinerary?", deleteFailed: "Delete failed, please try again.",
    shareFailed: "Share failed, please try again.", exportFailed: "Export failed, please try again.", pdfRestricted: "PDF export requires the Traveler plan or higher.",
  },
  "zh-CN": {
    loading: "正在加载行程…", notFound: "行程未找到", notFoundDesc: "此行程为私有内容或已被删除。",
    signInTitle: "登录后查看已保存的行程", signInDesc: "你保存的行程仅对你的账号可见。",
    signInCta: "登录", backToAi: "返回 AI 对话", saved: "已保存", shareTitle: "分享行程",
    copy: "复制链接", copied: "已复制！", close: "关闭", downloadTitle: "下载",
    renameTitle: "保存行程", renamePlaceholder: "行程名称", cancel: "取消", confirm: "保存",
    deleteConfirm: "确定删除此行程？", deleteFailed: "删除失败，请重试。",
    shareFailed: "分享失败，请重试。", exportFailed: "导出失败，请重试。", pdfRestricted: "PDF 导出需要 Traveler 及以上套餐。",
  },
  "zh-TW": {
    loading: "正在載入行程…", notFound: "找不到行程", notFoundDesc: "此行程為私有內容或已被刪除。",
    signInTitle: "登入後查看已儲存的行程", signInDesc: "你儲存的行程僅對你的帳號可見。",
    signInCta: "登入", backToAi: "返回 AI 對話", saved: "已儲存", shareTitle: "分享行程",
    copy: "複製連結", copied: "已複製！", close: "關閉", downloadTitle: "下載",
    renameTitle: "儲存行程", renamePlaceholder: "行程名稱", cancel: "取消", confirm: "儲存",
    deleteConfirm: "確定刪除此行程？", deleteFailed: "刪除失敗，請重試。",
    shareFailed: "分享失敗，請重試。", exportFailed: "匯出失敗，請重試。", pdfRestricted: "PDF 匯出需要 Traveler 以上方案。",
  },
  ja: {
    loading: "行程を読み込み中…", notFound: "行程が見つかりません", notFoundDesc: "この行程は非公開か削除されています。",
    signInTitle: "保存した行程を見るにはログイン", signInDesc: "保存した行程はアカウント限定です。",
    signInCta: "ログイン", backToAi: "AI チャットに戻る", saved: "保存済み", shareTitle: "行程を共有",
    copy: "リンクをコピー", copied: "コピーしました！", close: "閉じる", downloadTitle: "ダウンロード",
    renameTitle: "行程を保存", renamePlaceholder: "行程名", cancel: "キャンセル", confirm: "保存",
    deleteConfirm: "この行程を削除しますか？", deleteFailed: "削除に失敗しました。",
    shareFailed: "共有に失敗しました。", exportFailed: "出力に失敗しました。もう一度お試しください。", pdfRestricted: "PDF 出力には Traveler プラン以上が必要です。",
  },
  ko: {
    loading: "일정을 불러오는 중…", notFound: "일정을 찾을 수 없습니다", notFoundDesc: "이 일정은 비공개이거나 삭제되었습니다.",
    signInTitle: "저장한 일정을 보려면 로그인", signInDesc: "저장한 일정은 계정 전용입니다.",
    signInCta: "로그인", backToAi: "AI 채팅으로 돌아가기", saved: "저장됨", shareTitle: "일정 공유",
    copy: "링크 복사", copied: "복사됨!", close: "닫기", downloadTitle: "다운로드",
    renameTitle: "일정 저장", renamePlaceholder: "일정 이름", cancel: "취소", confirm: "저장",
    deleteConfirm: "이 일정을 삭제하시겠습니까?", deleteFailed: "삭제에 실패했습니다.",
    shareFailed: "공유에 실패했습니다.", exportFailed: "내보내기에 실패했습니다. 다시 시도해 주세요.", pdfRestricted: "PDF 내보내기는 Traveler 이상 플랜이 필요합니다.",
  },
};

const LANGS = new Set([
  "en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa",
]);

function detectLang(): string {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem("chinaconnect_language");
    if (stored && PAGE_LABELS[stored]) return stored;
  } catch {
    // ignore
  }
  const html = document.documentElement.lang;
  if (html && PAGE_LABELS[html]) return html;
  const nav = navigator.language || "en";
  if (PAGE_LABELS[nav]) return nav;
  const prefix = nav.split("-")[0];
  for (const key of Object.keys(PAGE_LABELS)) {
    if (key.toLowerCase().startsWith(prefix)) return key;
  }
  return "en";
}

function resolveId(): string {
  if (typeof window === "undefined") return "";
  const segs = window.location.pathname.split("/").filter(Boolean);
  const idx = segs.indexOf("itinerary");
  if (idx >= 0 && segs[idx + 1]) return segs[idx + 1];
  const fromQuery = new URLSearchParams(window.location.search).get("id");
  return fromQuery || "";
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

export default function SavedTripPage() {
  const [lang, setLang] = useState<string>(() => detectLang());
  const [state, setState] = useState<"loading" | "signin" | "notfound" | "ready">("loading");
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [shareCode, setShareCode] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const L = PAGE_LABELS[lang] || PAGE_LABELS.en;
  const langPrefix = lang && lang !== "en" ? "/" + lang : "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Sync the authoritative subscription tier from the server so the
      // PDF export gate uses the real plan instead of a stale local hint.
      fetchUsageFromServer().catch(() => {});
      const id = resolveId();
      if (!id) {
        setState("notfound");
        return;
      }
      const user = await getCurrentUser();
      if (cancelled) return;
      if (!user) {
        setState("signin");
        return;
      }
      const { data, error } = await supabase
        .from("ai_routes")
        .select("id, title, title_zh, summary, summary_zh, days, route_data, created_at, updated_at")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setState("notfound");
        return;
      }
      const it = routeRowToSavedItinerary(data as never, lang);
      setItinerary(it);
      setState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRename = useCallback(async () => {
    if (!itinerary || !renameValue.trim()) return;
    setRenaming(true);
    try {
      const newName = renameValue.trim();
      const titleLocalized: Record<string, string> = {};
      for (const l of ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"]) {
        titleLocalized[l] = newName;
      }
      const { data: existingRow } = await supabase
        .from("ai_routes")
        .select("route_data")
        .eq("id", itinerary.id)
        .maybeSingle();
      const rd = (existingRow?.route_data as Record<string, unknown>) ?? {};
      await supabase
        .from("ai_routes")
        .update({
          title: newName,
          title_zh: newName,
          route_data: { ...rd, title: newName, title_zh: newName, title_i18n: titleLocalized },
        })
        .eq("id", itinerary.id);
      setItinerary({ ...itinerary, name: renameValue.trim() });
      setShowRename(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2200);
    } catch (err) {
      console.error("rename failed", err);
    } finally {
      setRenaming(false);
    }
  }, [itinerary, renameValue]);

  const handleExport = useCallback(
    async (format: "text" | "json" | "pdf") => {
      if (!itinerary) return;
      if (format === "pdf") {
        const tier = getCurrentTier();
        const order = ["free", "explorer", "traveler", "business"];
        if (order.indexOf(tier) < order.indexOf("traveler")) {
          alert(L.pdfRestricted);
          return;
        }
      }
      const file = await downloadItineraryFile(itinerary, lang as ExportLang, format);
      if (!file) alert(L.exportFailed);
    },
    [itinerary, lang, L],
  );

  const handleShare = useCallback(async () => {
    if (!itinerary) return;
    try {
      const token =
        Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
      await supabase
        .from("ai_routes")
        .update({ share_token: token, is_public: true, status: "published" })
        .eq("id", itinerary.id);
      const origin = window.location.origin;
      setShareCode(`${origin}/trip/${token}`);
      setShowShare(true);
    } catch (err) {
      console.error("share failed", err);
      alert(L.shareFailed);
    }
  }, [itinerary, L]);

  const handleCopy = useCallback(() => {
    copyTextToClipboard(shareCode).then((ok) => {
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }).catch(console.error);
  }, [shareCode]);

  const handleDelete = useCallback(async () => {
    if (!itinerary) return;
    if (!window.confirm(L.deleteConfirm)) return;
    try {
      await supabase.from("ai_routes").delete().eq("id", itinerary.id);
      window.location.href = langPrefix + "/ai";
    } catch (err) {
      console.error("delete failed", err);
      alert(L.deleteFailed);
    }
  }, [itinerary, langPrefix, L]);

  if (state === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{L.loading}</p>
        </div>
      </div>
    );
  }

  if (state === "signin") {
    const next = typeof window !== "undefined" ? encodeURIComponent(window.location.pathname) : "";
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{L.signInTitle}</h1>
          <p className="text-gray-500 text-sm mb-6">{L.signInDesc}</p>
          <a
            href={`${langPrefix}/auth/login?next=${next}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            {L.signInCta} →
          </a>
        </div>
      </div>
    );
  }

  if (state === "notfound" || !itinerary) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{L.notFound}</h1>
          <p className="text-gray-500 text-sm mb-6">{L.notFoundDesc}</p>
          <a href={langPrefix + "/ai"} className="text-blue-600 text-sm hover:underline">
            ← {L.backToAi}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[70vh]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <a href={langPrefix + "/ai"} className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
            ← {L.backToAi}
          </a>
          {savedFlash && (
            <span className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-lg font-medium">
              ✓ {L.saved}
            </span>
          )}
        </div>
        <ItineraryDisplay
          itinerary={itinerary}
          language={lang as never}
          onSave={(name) => {
            setRenameValue(name);
            setShowRename(true);
          }}
          onExport={handleExport}
          onShare={handleShare}
          onDelete={handleDelete}
        />
      </div>

      {/* Share dialog */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl p-6 w-[26rem] shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-1">{L.shareTitle}</h3>
            <p className="text-xs text-gray-500 mb-3">chinaengage.org</p>
            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={shareCode}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
              >
                {copied ? L.copied : L.copy}
              </button>
            </div>
            <button onClick={() => setShowShare(false)} className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
              {L.close}
            </button>
          </div>
        </div>
      )}

      {/* Rename dialog */}
      {showRename && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRename(false)}>
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">{L.renameTitle}</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={L.renamePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRename(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {L.cancel}
              </button>
              <button
                onClick={handleRename}
                disabled={renaming}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {L.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
