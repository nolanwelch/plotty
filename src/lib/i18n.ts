import en from "@/locales/en.json";
import zh from "@/locales/zh.json";

type FlattenKeys<T, Prefix extends string = ""> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: FlattenKeys<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
      }[keyof T & string]
    : Prefix;

export type TranslationKey = FlattenKeys<typeof en>;

export type Locale = "en" | "zh";

function flatten(obj: Record<string, unknown>, prefix: string, out: Record<string, string>) {
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (typeof val === "string") {
      out[path] = val;
    } else if (typeof val === "object" && val !== null) {
      flatten(val as Record<string, unknown>, path, out);
    }
  }
}

const flatLocales: Record<Locale, Record<string, string>> = { en: {}, zh: {} };
for (const [key, data] of Object.entries({ en, zh })) {
  flatten(data as Record<string, unknown>, "", flatLocales[key as Locale]);
}

function detectLocale(): Locale {
  if (typeof navigator !== "undefined") {
    const lang = navigator.language;
    if (lang.startsWith("zh")) return "zh";
  }
  return "en";
}

let currentLocale: Locale = detectLocale();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let result = flatLocales[getLocale()][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replaceAll(`{${k}}`, String(v));
    }
  }
  return result;
}
