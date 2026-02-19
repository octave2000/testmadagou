"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/lib/i18n-client";
import { type Language } from "@/lib/i18n";

const LanguageSwitcher = () => {
  const { t, language, setLanguage } = useTranslations();

  return (
    <Select
      value={language}
      onValueChange={(value) => setLanguage(value as Language)}
    >
      <SelectTrigger
        className="h-8 w-[90px] rounded-lg border-gray-200 bg-white/80 text-[10px] sm:h-9 sm:w-[130px] sm:text-sm"
        aria-label={t("language.label")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="fr">{t("language.french")}</SelectItem>
        <SelectItem value="en">{t("language.english")}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
