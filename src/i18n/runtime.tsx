/**
 * Translation runtime for the interactive tools (Preact islands and services).
 * Each island receives its locale's messages as a prop and calls initI18n() before rendering;
 * only that one dictionary is shipped to the browser.
 */
import type { ComponentType } from 'preact';
import { translate, type Locale } from './locales';

let messages: Record<string, string> = {};
let current: Locale = 'en';

export function initI18n(locale: Locale, dict: Record<string, string>): void {
  current = locale;
  messages = dict;
}

export function t(key: string, params?: Record<string, string | number>): string {
  return translate(messages, key, params);
}

export const getLocale = (): Locale => current;

/** Formats an integer with the locale's digit grouping (e.g. byte counts). */
export const num = (n: number): string => n.toLocaleString(current === 'zh' ? 'zh-CN' : current);

export interface I18nProps {
  locale: Locale;
  messages: Record<string, string>;
}

/** Wraps a tool component so it initialises translations (on the server and in the browser). */
export function withI18n<P extends object>(Component: ComponentType<P>) {
  return function Localized(props: P & I18nProps) {
    initI18n(props.locale, props.messages);
    return <Component {...props} />;
  };
}
