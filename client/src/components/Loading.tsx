import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslations } from "@/lib/i18n-client";

const Loading = () => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 flex gap-2 items-center justify-center bg-background/50">
      <Loader2 className="w-6 h-6 animate-spin text-primary-700" />
      <span className="text-sm font-medium text-primary-700">
        {t("common.loading")}
      </span>
    </div>
  );
};

export default Loading;
