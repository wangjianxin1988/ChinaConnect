/**
 * Business data freshness metadata
 * Tracks when each business data file was last verified and its primary source.
 * Read by verify-business-data.mjs and by the *Client.tsx components to show
 * a "Last verified" stamp in the UI.
 *
 * Re-verify schedule: quarterly. Update the timestamp + run `pnpm business:verify`.
 */

export interface DataSourceMeta {
  /** ISO date string (YYYY-MM-DD) when the data was last manually verified */
  lastVerified: string;
  /** Primary authoritative source URL (event organizer, government agency, etc.) */
  sourceUrl: string;
  /** Short label for the source (e.g. "Canton Fair official site") */
  sourceLabel: string;
  /** How often this dataset should be re-verified */
  reVerifyInterval: 'quarterly' | 'biannual' | 'annual';
  /** Optional notes for the verifier */
  notes?: string;
}

export const BUSINESS_DATA_META: Record<string, DataSourceMeta> = {
  'expo-calendar': {
    lastVerified: '2026-06-23',
    sourceUrl: 'https://www.cantonfair.org.cn',
    sourceLabel: 'Canton Fair official site (representative)',
    reVerifyInterval: 'quarterly',
    notes: 'Each expo entry has its own organizer URL in expo-calendar.ts; this is the headline reference.',
  },
  'company-registration': {
    lastVerified: '2026-06-23',
    sourceUrl: 'https://www.gov.cn',
    sourceLabel: 'State Council - Market Regulation (AMR)',
    reVerifyInterval: 'biannual',
    notes: 'Foreign Investment Law and AMR procedures; check Negative List and MOFCOM updates.',
  },
  'etiquette': {
    lastVerified: '2026-06-23',
    sourceUrl: 'https://www.china-briefing.com',
    sourceLabel: 'China Briefing business culture guides',
    reVerifyInterval: 'biannual',
    notes: 'Business etiquette norms evolve slowly; re-verify every 6 months.',
  },
  'invitation-letter': {
    lastVerified: '2026-06-23',
    sourceUrl: 'https://www.visaforchina.cn',
    sourceLabel: 'China Visa Application Service Center',
    reVerifyInterval: 'biannual',
    notes: 'Invitation letter format requirements per Chinese embassies/consulates.',
  },
  'translation': {
    lastVerified: '2026-06-23',
    sourceUrl: 'https://www.tac-online.org.cn',
    sourceLabel: 'Translators Association of China (TAC)',
    reVerifyInterval: 'annual',
    notes: 'Industry pricing is a market reference; actual rates vary by provider.',
  },
};

/**
 * For each data file, list the source URLs that verify-business-data.mjs should HEAD-check.
 * Keys match BUSINESS_DATA_META; values are arrays of URL strings.
 */
export const BUSINESS_URLS_TO_CHECK: Record<string, string[]> = {
  'expo-calendar': [
    'https://www.cantonfair.org.cn',
    'https://www.ciff-gz.com',
    'https://en.ciff-sh.com',
    'https://www.cpca.org.cn',
    'https://www.autochinashow.org',
    'https://www.intertextileapparel.com',
    'https://www.cmef.com.cn',
    'https://www.bauma-china.com',
    'https://www.ciftis.org',
    'https://www.yw.gov.cn',
  ],
  'company-registration': [
    'https://www.gov.cn',
    'https://www.mofcom.gov.cn',
  ],
  'etiquette': [
    'https://www.china-briefing.com',
  ],
  'invitation-letter': [
    'https://www.visaforchina.cn',
  ],
  'translation': [
    'https://www.tac-online.org.cn',
  ],
};