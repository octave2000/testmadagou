import { Suspense } from "react";
import SearchClient from "./searchClient";
import { t } from "@/lib/i18n";

export default function Page() {
  return (
    <Suspense fallback={<div>{t("common.loading")}</div>}>
      <SearchClient />
    </Suspense>
  );
}
