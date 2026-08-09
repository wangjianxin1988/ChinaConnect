// Per-language city data loader.
// Resolves /src/data/cities-i18n/<lang>/<slug>.json if exists, else falls back to canonical /src/data/cities/<slug>.json.

const enFiles = import.meta.glob("./cities/*.json", { eager: true }) as Record<string, any>;
const i18nFiles = import.meta.glob("./cities-i18n/*/*.json", { eager: true }) as Record<string, any>;

const slugFromPath = (p: string): string | null => {
  const m = p.match(/([^/]+)\.json$/);
  return m ? m[1] : null;
};
const langFromPath = (p: string): string | null => {
  const m = p.match(/\/cities-i18n\/([^/]+)\//);
  return m ? m[1] : null;
};

const buildIndex = (): Record<string, any> => {
  const idx: Record<string, any> = {};
  for (const [path, mod] of Object.entries(enFiles)) {
    const slug = slugFromPath(path);
    if (slug) idx["en:" + slug] = (mod as any).default ?? mod;
  }
  for (const [path, mod] of Object.entries(i18nFiles)) {
    const lang = langFromPath(path);
    const slug = slugFromPath(path);
    if (lang && slug) idx[lang + ":" + slug] = (mod as any).default ?? mod;
  }
  return idx;
};

let INDEX: Record<string, any> | null = null;
const getIndex = (): Record<string, any> => {
  if (!INDEX) INDEX = buildIndex();
  return INDEX;
};

export function getCityData(slug: string, lang: string): any {
  const idx = getIndex();
  if (lang && lang !== "en" && idx[lang + ":" + slug]) return idx[lang + ":" + slug];
  return idx["en:" + slug];
}

export function getCities(slugList: string[], lang: string): any[] {
  return slugList.map((s) => getCityData(s, lang)).filter(Boolean);
}