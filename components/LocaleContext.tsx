"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type Locale, localeInfo } from "@/lib/locales";
import { MESSAGES, type Messages } from "@/lib/messages";

type LocaleValue = { locale: Locale; intl: string; t: Messages };

const LocaleContext = createContext<LocaleValue>({ locale: DEFAULT_LOCALE, intl: "en-GB", t: MESSAGES[DEFAULT_LOCALE] });

// Wraps the screens that follow the "Explain in" language: loading, errors,
// the result, the reply and the chat.
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, intl: localeInfo(locale).intl, t: MESSAGES[locale] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

// "português" -> "Português" for labels that start a line.
export function capitalize(text: string, intl: string) {
  return text ? text.charAt(0).toLocaleUpperCase(intl) + text.slice(1) : text;
}
