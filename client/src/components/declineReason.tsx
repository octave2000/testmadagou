import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useTranslations } from "@/lib/i18n-client";

export function ReasonDialog({ reason }: { reason: string }) {
  const { t } = useTranslations();

  return (
    <Dialog>
      <DialogTrigger>
        <span className="bg-red-500 px-2 inline-block mt-4 py-0.5 rounded-md text-white animate-bounce">
          {t("property.declined")}
        </span>
      </DialogTrigger>
      <DialogContent>
        <div className="max-w-4xl h-10 flex flex-col gap-2">
          <p className="font-bold">{t("decline.reason")}:</p>
          <p>{reason}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
