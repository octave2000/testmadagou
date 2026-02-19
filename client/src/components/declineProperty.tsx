"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useDeclinePropertyMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useTranslations } from "@/lib/i18n-client";

export function DeclineDialog({ propertyId }: { propertyId: number }) {
  const [reason, setReason] = useState("");
  const [declineProperty] = useDeclinePropertyMutation();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslations();
  const isDisabled = !reason.trim();
  const handleSubmit = async () => {
    await declineProperty({ id: propertyId, reason: reason }).unwrap();

    setOpen(false);
    setReason("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <Button className="bg-red-500 w-full inline-block mt-4  rounded-md text-white ">
          {t("decline.decline")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-8">
          <div className="max-w-4xl h-32 flex flex-col gap-2">
            <Label>{t("decline.inputReason")}</Label>

            <Textarea
              id="reason"
              name="reason"
              placeholder={t("decline.reasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
          <div>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 w-full"
              disabled={isDisabled}
            >
              {t("common.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
