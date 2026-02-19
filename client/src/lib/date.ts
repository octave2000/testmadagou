import type { Language } from "@/lib/i18n";

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
};

const DEFAULT_TIMEZONE = "UTC";

export const formatDate = (
  value: Date | string | number,
  language: Language,
  options?: Intl.DateTimeFormatOptions,
) => {
  const locale = LOCALE_BY_LANGUAGE[language] ?? "fr-FR";
  return new Intl.DateTimeFormat(locale, {
    timeZone: DEFAULT_TIMEZONE,
    ...options,
  }).format(new Date(value));
};
