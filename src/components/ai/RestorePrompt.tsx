/**
 * RestorePrompt Component
 * Shows when there's an unsaved conversation snapshot from a previous session.
 * Offers to restore or dismiss the conversation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { findRestorableConversation, dismissRestorableConversation } from '@/lib/ai/route-saver';
import { getLocalStorageManager, deserializeMessage } from '@/lib/ai/local-storage-manager';
import type { Message } from '@/lib/ai/types';

// ============================================
// Types
// ============================================

interface RestorePromptProps {
  /** Called when user chooses to restore the conversation */
  onRestore: (conversationId: string, messages: Message[]) => void;
  /** Called when user dismisses the prompt */
  onDismiss?: () => void;
  /** UI language */
  language?: 'en' | 'zh' | 'ja' | 'ko';
  /** Auto-dismiss after N seconds (0 = no auto-dismiss) */
  autoDismissSeconds?: number;
}

interface RestorableInfo {
  conversationId: string;
  messageCount: number;
  savedAt: string;
  preview: string;
}

// ============================================
// Component
// ============================================

export const RestorePrompt: React.FC<RestorePromptProps> = ({
  onRestore,
  onDismiss,
  language = 'en',
  autoDismissSeconds = 30,
}) => {
  const [restorable, setRestorable] = useState<RestorableInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [countdown, setCountdown] = useState(autoDismissSeconds);

  // Check for restorable conversation on mount
  useEffect(() => {
    const info = findRestorableConversation();
    if (info) {
      setRestorable(info);
      setIsVisible(true);
    }
  }, []);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!isVisible || autoDismissSeconds <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, autoDismissSeconds]);

  // Handle restore
  const handleRestore = useCallback(async () => {
    if (!restorable || isRestoring) return;

    setIsRestoring(true);

    try {
      const lsm = getLocalStorageManager();
      const snapshot = lsm.loadSnapshot(restorable.conversationId);

      if (snapshot) {
        const messages = snapshot.messages.map(deserializeMessage);
        onRestore(restorable.conversationId, messages);
      }
    } catch (err) {
      console.error('[RestorePrompt] Failed to restore:', err);
    } finally {
      setIsRestoring(false);
      setIsVisible(false);
    }
  }, [restorable, isRestoring, onRestore]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (restorable) {
      dismissRestorableConversation(restorable.conversationId);
    }
    setIsVisible(false);
    onDismiss?.();
  }, [restorable, onDismiss]);

  // Don't render if nothing to restore
  if (!isVisible || !restorable) return null;

  // Format saved time
  const savedTime = formatRelativeTime(restorable.savedAt, language);

  // Labels
  const L = LABELS[language] || LABELS.en;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slideUp">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {L.title}
            </span>
          </div>
          {autoDismissSeconds > 0 && (
            <span className="text-blue-200 text-xs">{countdown}s</span>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-gray-700 mb-1">{L.description}</p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">
              {L.messageCount.replace('{count}', String(restorable.messageCount))}
            </p>
            <p className="text-sm text-gray-800 line-clamp-2 font-medium">
              &ldquo;{restorable.preview}&rdquo;
            </p>
            <p className="text-xs text-gray-400 mt-1">{savedTime}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {L.dismiss}
            </button>
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {isRestoring ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {L.restoring}
                </>
              ) : (
                L.restore
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// ============================================
// Labels
// ============================================

const LABELS: Record<string, { title: string; description: string; messageCount: string; restore: string; restoring: string; dismiss: string }> = {
  en: {
    title: 'Unsaved Conversation',
    description: 'You have a conversation from your last session that wasn\'t saved.',
    messageCount: '{count} messages',
    restore: 'Restore',
    restoring: 'Restoring...',
    dismiss: 'Dismiss',
  },
  zh: {
    title: '未保存的对话',
    description: '您上次会话中有一个未保存的对话。',
    messageCount: '{count} 条消息',
    restore: '恢复',
    restoring: '恢复中...',
    dismiss: '忽略',
  },
  ja: {
    title: '未保存の会話',
    description: '前回のセッションに未保存の会話があります。',
    messageCount: '{count} 件のメッセージ',
    restore: '復元',
    restoring: '復元中...',
    dismiss: '閉じる',
  },
  ko: {
    title: '저장되지 않은 대화',
    description: '이전 세션에서 저장되지 않은 대화가 있습니다.',
    messageCount: '{count}개의 메시지',
    restore: '복원',
    restoring: '복원 중...',
    dismiss: '닫기',
  },
};

// ============================================
// Helpers
// ============================================

function formatRelativeTime(isoString: string, language: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (language === 'zh') {
    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return diffMin + ' 分钟前';
    if (diffHours < 24) return diffHours + ' 小时前';
    return diffDays + ' 天前';
  }

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return diffMin + ' min ago';
  if (diffHours < 24) return diffHours + 'h ago';
  return diffDays + 'd ago';
}

export default RestorePrompt;
