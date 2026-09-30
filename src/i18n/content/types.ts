import type { ToolContent } from '../../data/content';
import type { ToolSlug } from '../../data/tools';

/** Translated tool metadata (the English source lives in src/data/tools.ts). */
export interface ToolText {
  name: string;
  h1: string;
  title: string;
  description: string;
  tagline: string;
  /** Extra words for the on-page search (English terms are always added too). */
  searchTerms: string[];
}

export interface LocaleContent {
  tools: Partial<Record<ToolSlug, ToolText>>;
  content: Partial<Record<ToolSlug, ToolContent>>;
}
