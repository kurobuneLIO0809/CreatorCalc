/**
 * Build-time i18n helpers for Astro pages. Nothing here is shipped to the browser except the
 * per-locale UI dictionary that pages pass to each tool island.
 */
import { features, site as siteConfig } from '../config/site';
import { content as enContent, type ToolContent } from '../data/content';
import { tools, type ToolMeta, type ToolSlug } from '../data/tools';
import { LOCALES, DEFAULT_LOCALE, localePath, translate, type Locale } from './locales';
import { ui as enUi } from './ui/en';
import { ui as jaUi } from './ui/ja';
import { ui as zhUi } from './ui/zh';
import { ui as koUi } from './ui/ko';
import { ui as frUi } from './ui/fr';
import { ui as itUi } from './ui/it';
import { site as enSite, type SiteKey } from './site/en';
import { site as jaSite } from './site/ja';
import { site as zhSite } from './site/zh';
import { site as koSite } from './site/ko';
import { site as frSite } from './site/fr';
import { site as itSite } from './site/it';
import type { LocaleContent } from './content/types';
import { ja } from './content/ja';
import { zh } from './content/zh';
import { ko } from './content/ko';
import { fr } from './content/fr';
import { it } from './content/it';

export { LOCALES, DEFAULT_LOCALE, localePath, type Locale } from './locales';
export { LOCALE_INFO, isLocale } from './locales';

const UI: Record<Locale, Record<string, string>> = { en: enUi, ja: jaUi, zh: zhUi, ko: koUi, fr: frUi, it: itUi };
const SITE: Record<Locale, Record<string, string>> = { en: enSite, ja: jaSite, zh: zhSite, ko: koSite, fr: frSite, it: itSite };
const CONTENT: Record<Exclude<Locale, 'en'>, LocaleContent> = { ja, zh, ko, fr, it };

/** Non-English locales are published. */
export const TRANSLATED_LOCALES = LOCALES.filter((l): l is Exclude<Locale, 'en'> => l !== DEFAULT_LOCALE);

/** UI messages for the tool islands (English fills any gap). */
export function uiMessages(locale: Locale): Record<string, string> {
  return locale === DEFAULT_LOCALE ? enUi : { ...enUi, ...UI[locale] };
}

/** Page-chrome translator; `{site}` is always the brand name. */
export function siteT(locale: Locale) {
  const dict = SITE[locale];
  return (key: SiteKey, params: Record<string, string | number> = {}) => translate(dict, key, { site: siteConfig.name, ...params });
}

/**
 * A tool is published in a locale only when both its metadata and its full page content are translated.
 * The translated texts describe the HEIC-off build; if the HEIC decoder is enabled they would be
 * inaccurate, so non-English pages are withheld until they are reviewed (see docs/seo.md).
 */
export function hasTranslation(locale: Locale, slug: ToolSlug): boolean {
  if (locale === 'en') return true;
  if (features.heicDecoder) return false;
  return !!CONTENT[locale].tools[slug] && !!CONTENT[locale].content[slug];
}

/** Tools available in a locale, with names, titles and descriptions in that language. */
export function localizedTools(locale: Locale): ToolMeta[] {
  if (locale === 'en') return tools;
  return tools
    .filter((t) => hasTranslation(locale, t.slug))
    .map((t) => {
      const tr = CONTENT[locale].tools[t.slug]!;
      return {
        ...t,
        ...tr,
        // Visitors often type English format names, so both vocabularies are searchable.
        searchTerms: [...tr.searchTerms, t.name, ...t.searchTerms],
        related: t.related.filter((r) => hasTranslation(locale, r)),
      };
    });
}

export function toolContent(locale: Locale, slug: ToolSlug): ToolContent {
  if (locale === 'en') return enContent[slug];
  const c = CONTENT[locale].content[slug];
  if (!c) throw new Error(`Missing ${locale} content for ${slug}`);
  return c;
}

export type Alternates = Partial<Record<Locale, string>>;

/** hreflang alternates for a path that exists in every locale (home, tools index). */
export function allLocaleAlternates(path: string): Alternates {
  return Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)]));
}

/** hreflang alternates for a tool page: only locales where that tool is translated. */
export function toolAlternates(slug: ToolSlug): Alternates {
  return Object.fromEntries(LOCALES.filter((l) => hasTranslation(l, slug)).map((l) => [l, localePath(l, `/tools/${slug}`)]));
}
