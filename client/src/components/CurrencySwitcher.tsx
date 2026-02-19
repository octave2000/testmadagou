"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyCode } from "@/lib/currency";
import { useTranslations } from "@/lib/i18n-client";
import { setCurrency } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";

const CurrencySwitcher = () => {
  const { t } = useTranslations();
  const currency = useAppSelector((state) => state.global.currency);
  const dispatch = useAppDispatch();

  return (
    <Select
      value={currency}
      onValueChange={(value) => dispatch(setCurrency(value as CurrencyCode))}
    >
      <SelectTrigger
        className="h-8 w-[90px] rounded-lg border-gray-200 bg-white/80 text-[10px] sm:h-9 sm:w-[120px] sm:text-sm"
        aria-label={t("currency.label")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="XAF">{t("currency.xaf")}</SelectItem>
        <SelectItem value="USD">{t("currency.usd")}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CurrencySwitcher;
