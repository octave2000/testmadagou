"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  getLanguage,
  hydrateLanguage,
  setLanguage,
  subscribe,
  translate,
  type Language,
} from "@/lib/i18n";

export const useLanguage = () =>
  useSyncExternalStore(subscribe, getLanguage, getLanguage);

export const useTranslations = () => {
  const language = useLanguage();

  const t = useMemo(
    () => (key: string, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language],
  );

  return { t, language, setLanguage };
};

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const language = useLanguage();

  useEffect(() => {
    hydrateLanguage();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
};
