import { content as enContent } from '../../src/data/content';
import { tools } from '../../src/data/tools';
import { hasTranslation, localizedTools, siteT, toolAlternates, toolContent, TRANSLATED_LOCALES, uiMessages } from '../../src/i18n';
import { localePath, translate } from '../../src/i18n/locales';
import { ui as enUi } from '../../src/i18n/ui/en';
import { ui as jaUi } from '../../src/i18n/ui/ja';
import { ui as zhUi } from '../../src/i18n/ui/zh';
import { ui as koUi } from '../../src/i18n/ui/ko';
import { ui as frUi } from '../../src/i18n/ui/fr';
import { ui as itUi } from '../../src/i18n/ui/it';
import { site as enSite } from '../../src/i18n/site/en';
import { site as jaSite } from '../../src/i18n/site/ja';
import { site as zhSite } from '../../src/i18n/site/zh';
import { site as koSite } from '../../src/i18n/site/ko';
import { site as frSite } from '../../src/i18n/site/fr';
import { site as itSite } from '../../src/i18n/site/it';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const dictionaries = {
  ui: { en: enUi, ja: jaUi, zh: zhUi, ko: koUi, fr: frUi, it: itUi } as Record<string, Record<string, string>>,
  site: { en: enSite, ja: jaSite, zh: zhSite, ko: koSite, fr: frSite, it: itSite } as Record<string, Record<string, string>>,
};

describe('translation dictionaries', () => {
  for (const [kind, dicts] of Object.entries(dictionaries)) {
    for (const locale of TRANSLATED_LOCALES) {
      it(`${kind}/${locale} has exactly the English keys with the same placeholders`, () => {
        const en = dicts.en;
        const tr = dicts[locale];
        expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort());
        for (const key of Object.keys(en)) {
          expect(tr[key].trim(), `${locale}:${key} is empty`).not.toBe('');
          expect(placeholders(tr[key]), `${locale}:${key}`).toEqual(placeholders(en[key]));
        }
      });
    }
  }
});

describe('translate()', () => {
  it('interpolates and picks plural forms', () => {
    const dict = { hi: 'Hi {name}', n_one: '{count} file', n_other: '{count} files' };
    expect(translate(dict, 'hi', { name: 'A' })).toBe('Hi A');
    expect(translate(dict, 'n', { count: 1 })).toBe('1 file');
    expect(translate(dict, 'n', { count: 3 })).toBe('3 files');
    expect(translate(dict, 'missing')).toBe('missing');
  });

  it('siteT always fills the brand name', () => {
    expect(siteT('ja')('nav.homeLabel')).toMatch(/Wrenfile/);
  });

  it('uiMessages falls back to English for every key', () => {
    for (const locale of TRANSLATED_LOCALES) expect(Object.keys(uiMessages(locale)).length).toBe(Object.keys(enUi).length);
  });
});

describe('localized tool pages', () => {
  it('builds prefixed paths', () => {
    expect(localePath('en', '/tools')).toBe('/tools');
    expect(localePath('ja', '/')).toBe('/ja');
    expect(localePath('fr', '/tools/image-resizer')).toBe('/fr/tools/image-resizer');
  });

  for (const locale of TRANSLATED_LOCALES) {
    it(`${locale}: every published tool is fully translated and mirrors the English page structure`, () => {
      const localized = localizedTools(locale);
      expect(localized.map((t) => t.slug)).toEqual(tools.map((t) => t.slug));
      const titles = new Set<string>();
      for (const tool of localized) {
        expect(hasTranslation(locale, tool.slug)).toBe(true);
        expect(tool.name).not.toBe(tools.find((t) => t.slug === tool.slug)!.name);
        titles.add(tool.title);
        const c = toolContent(locale, tool.slug);
        const en = enContent[tool.slug];
        for (const part of ['steps', 'useCases', 'specs', 'faq'] as const) {
          expect(c[part].length, `${locale}/${tool.slug}.${part}`).toBe(en[part].length);
        }
        expect(c.intro.length).toBeGreaterThan(0);
        expect(c.limits.length).toBeGreaterThan(0);
        // Related tools must link only to pages that exist in this language.
        for (const r of tool.related) expect(hasTranslation(locale, r)).toBe(true);
      }
      expect(titles.size).toBe(localized.length);
    });
  }

  it('hreflang alternates include English and every translation', () => {
    const alt = toolAlternates('image-resizer');
    expect(Object.keys(alt).sort()).toEqual(['en', 'fr', 'it', 'ja', 'ko', 'zh']);
    expect(alt.en).toBe('/tools/image-resizer');
  });

  it('translated pages do not mention HEIC support while the decoder is disabled', () => {
    for (const locale of TRANSLATED_LOCALES) {
      for (const tool of localizedTools(locale)) {
        if (tool.slug === 'exif-viewer') continue; // reading HEIC metadata works without the decoder
        const text = JSON.stringify(toolContent(locale, tool.slug).specs.map(([, v]) => v));
        expect(text, `${locale}/${tool.slug}`).not.toMatch(/HEIC/);
      }
    }
  });
});
