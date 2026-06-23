import React from "react";
import { BUSINESS_DATA_META } from "@/data/guide/business/_meta";

interface Props {
  /** Data file key, e.g. "expo-calendar" */
  dataKey: keyof typeof BUSINESS_DATA_META;
  /** Optional override label */
  label?: string;
}

/**
 * Small "Last verified" pill rendered under page hero banners.
 * Reads from BUSINESS_DATA_META so the verify-business-data.mjs script
 * has a single source of truth for the date.
 */
export const LastVerifiedStamp: React.FC<Props> = ({ dataKey, label }) => {
  const meta = BUSINESS_DATA_META[dataKey];
  if (!meta) return null;
  return (
    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {label ?? "Last verified"}: {meta.lastVerified}
      </span>
      <span className="text-white/50">|</span>
      <a
        href={meta.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-white"
      >
        {meta.sourceLabel}
      </a>
    </div>
  );
};

export default LastVerifiedStamp;
