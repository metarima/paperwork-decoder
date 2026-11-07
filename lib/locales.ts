// The languages a letter can be explained in. `code` travels between the
// browser and the API, `name` goes into prompts (models follow English
// language names most reliably), `label` is what the picker shows, and `intl`
// formats dates, money and relative days.
export const LOCALES = [
  { code: "en", name: "English", label: "English", intl: "en-GB" },
  { code: "pt", name: "European Portuguese", label: "Português", intl: "pt-PT" },
  { code: "es", name: "Spanish", label: "Español", intl: "es-ES" },
  { code: "fr", name: "French", label: "Français", intl: "fr-FR" },
  { code: "de", name: "German", label: "Deutsch", intl: "de-DE" },
  { code: "it", name: "Italian", label: "Italiano", intl: "it-IT" },
  { code: "uk", name: "Ukrainian", label: "Українська", intl: "uk-UA" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const LOCALE_CODES = LOCALES.map((l) => l.code) as [Locale, ...Locale[]];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export function localeInfo(code: Locale) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

// First supported language in the browser's preference list, e.g.
// ["pt-BR", "en-US"] -> "pt".
export function localeFromBrowser(languages: readonly string[]): Locale {
  for (const tag of languages) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

// A language's name written in the reader's language, e.g. "pt" shown to a
// German reader is "Portugiesisch". Falls back to the code.
export function languageName(languageCode: string, inLocale: Locale) {
  try {
    const name = new Intl.DisplayNames([localeInfo(inLocale).intl], { type: "language" }).of(languageCode);
    return name ?? languageCode;
  } catch {
    return languageCode;
  }
}
