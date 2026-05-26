/**
 * useBestAnswer - Mark/unmark best answers in Q&A posts
 * Persists to localStorage since there's no backend API for this yet.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "chinaconnect-best-answers";
const POINTS_BEST_ANSWER = 50;

interface BestAnswerRecord {
  postId: string;
  answerId: string;
  markedAt: number;
}

interface BestAnswerState {
  [postId: string]: string; // answerId
}

function loadBestAnswers(): BestAnswerState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBestAnswers(state: BestAnswerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export interface UseBestAnswerReturn {
  /** The answerId marked as best for a given post, or null */
  getBestAnswer: (postId: string) => string | null;
  /** Mark an answer as the best answer for a post */
  markBest: (postId: string, answerId: string) => void;
  /** Unmark the current best answer for a post */
  unmarkBest: (postId: string) => void;
  /** Check if an answer is the best answer for a post */
  isBestAnswer: (postId: string, answerId: string) => boolean;
  /** All best answer records */
  allRecords: BestAnswerRecord[];
}

export function useBestAnswer(): UseBestAnswerReturn {
  const [state, setState] = useState<BestAnswerState>({});

  useEffect(() => {
    setState(loadBestAnswers());
  }, []);

  const getBestAnswer = useCallback(
    (postId: string): string | null => {
      return state[postId] || null;
    },
    [state],
  );

  const markBest = useCallback(
    (postId: string, answerId: string) => {
      setState((prev) => {
        const next = { ...prev, [postId]: answerId };
        saveBestAnswers(next);
        return next;
      });
    },
    [],
  );

  const unmarkBest = useCallback((postId: string) => {
    setState((prev) => {
      const next = { ...prev };
      delete next[postId];
      saveBestAnswers(next);
      return next;
    });
  }, []);

  const isBestAnswer = useCallback(
    (postId: string, answerId: string): boolean => {
      return state[postId] === answerId;
    },
    [state],
  );

  const allRecords: BestAnswerRecord[] = Object.entries(state).map(
    ([postId, answerId]) => ({
      postId,
      answerId,
      markedAt: Date.now(), // timestamp not stored in v1
    }),
  );

  return {
    getBestAnswer,
    markBest,
    unmarkBest,
    isBestAnswer,
    allRecords,
  };
}