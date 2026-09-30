/** Supported languages. English is the default and lives at the root URL; others get a prefix. */
export const LOCALES = ['en', 'ja', 'zh', 'ko', 'fr', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleInfo {
  /** Name in the language itself, shown in the language switcher. */
  nativeName: string;
  /** Value for <html lang> and hreflang (BCP 47). */
  htmlLang: string;
  ogLocale: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { nativeName: 'English', htmlLang: 'en', ogLocale: 'en_US' },
  ja: { nativeName: '日本語', htmlLang: 'ja', ogLocale: 'ja_JP' },
  zh: { nativeName: '简体中文', htmlLang: 'zh-Hans', ogLocale: 'zh_CN' },
  ko: { nativeName: '한국어', htmlLang: 'ko', ogLocale: 'ko_KR' },
  fr: { nativeName: 'Français', htmlLang: 'fr', ogLocale: 'fr_FR' },
  it: { nativeName: 'Italiano', htmlLang: 'it', ogLocale: 'it_IT' },
};

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

/** "/tools/x" → "/ja/tools/x" for non-default locales. */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/** Interpolates {name} placeholders and picks `key_one`/`key_other` from a `count` param. */
export function translate(dict: Record<string, string>, key: string, params?: Record<string, string | number>): string {
  let k = key;
  if (params && typeof params.count === 'number') {
    const plural = `${key}_${params.count === 1 ? 'one' : 'other'}`;
    if (plural in dict) k = plural;
  }
  const s = dict[k] ?? key;
  return params ? s.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m)) : s;
}
