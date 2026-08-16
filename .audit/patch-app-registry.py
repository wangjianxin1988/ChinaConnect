import re
p = "src/i18n/app-overrides.ts"
src = open(p, encoding="utf-8").read()

old = '''function extractMap(mod: Record<string, unknown>): Record<string, string> | undefined {
  for (const value of Object.values(mod)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, string>;
    }
  }
  return undefined;
}

function buildRegistry(modules: Record<string, Record<string, unknown>>): Record<string, Record<string, string>> {
  const registry: Record<string, Record<string, string>> = {};
  for (const [file, mod] of Object.entries(modules)) {
    const match = /overrides-([\\w-]+)\\.ts$/.exec(file);
    if (match) {
      const map = extractMap(mod);
      if (map) registry[match[1]] = map;
    }
  }
  return registry;
}

const APP_OVERRIDES = buildRegistry(APP_OVERRIDE_MODULES);
const EMERGENCY_OVERRIDES = buildRegistry(EMERGENCY_OVERRIDE_MODULES);

/** Look up an app description / category label translation (key: "app:<id>" | "cat:<category>"). */
export function getAppOverride(lang: string | undefined, key: string): string | undefined {
  return lang ? APP_OVERRIDES[lang]?.[key] : undefined;
}

/** Look up a national emergency contact translation (key: "ename:<phone>" | "edesc:<phone>"). */
export function getEmergencyOverride(lang: string | undefined, key: string): string | undefined {
  return lang ? EMERGENCY_OVERRIDES[lang]?.[key] : undefined;
}'''

new = '''// Merge every exported record from an override module. Each export is stored
// under a prefix derived from its export name so component lookups
// ("app:<id>", "cat:<cat>", "ename:<phone>", "edesc:<phone>") match exactly.
const EXPORT_PREFIX = {
  APP_OVERRIDES: "app:",
  APP_CATEGORY_OVERRIDES: "cat:",
  EMERGENCY_NAME_OVERRIDES: "ename:",
  EMERGENCY_DESC_OVERRIDES: "edesc:",
};

function buildRegistry(modules: Record<string, Record<string, unknown>>): Record<string, Record<string, string>> {
  const registry: Record<string, Record<string, string>> = {};
  for (const [file, mod] of Object.entries(modules)) {
    const match = /overrides-([\\w-]+)\\.ts$/.exec(file);
    if (match) {
      const lang = match[1];
      for (const [exportName, value] of Object.entries(mod)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const prefix = EXPORT_PREFIX[exportName] ?? "";
          for (const [k, v] of Object.entries(value as Record<string, string>)) {
            registry[lang] = { ...(registry[lang] || {}), [prefix + k]: v };
          }
        }
      }
    }
  }
  return registry;
}

const APP_OVERRIDES = buildRegistry(APP_OVERRIDE_MODULES);
const EMERGENCY_OVERRIDES = buildRegistry(EMERGENCY_OVERRIDE_MODULES);

/** Look up an app description / category label translation (key: "app:<id>" | "cat:<category>"). */
export function getAppOverride(lang: string | undefined, key: string): string | undefined {
  return lang ? APP_OVERRIDES[lang]?.[key] : undefined;
}

/** Look up a national emergency contact translation (key: "ename:<phone>" | "edesc:<phone>"). */
export function getEmergencyOverride(lang: string | undefined, key: string): string | undefined {
  return lang ? EMERGENCY_OVERRIDES[lang]?.[key] : undefined;
}'''

assert old in src, "old block not found"
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched app-overrides.ts OK")
