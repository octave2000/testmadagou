"use client";

import React from "react";
import { Trash2 } from "lucide-react";

import { Property } from "@/types/prismaTypes";
import { useTranslations } from "@/lib/i18n-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeletePropertyModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  property: Property;
  onClose: () => void;
  onConfirm: (property: Property) => void;
}

const DeletePropertyModal = ({
  isOpen,
  isLoading = false,
  property,
  onClose,
  onConfirm,
}: DeletePropertyModalProps) => {
  const { t } = useTranslations();
  const address = property.location?.address ?? "";
  const city = property.location?.city ?? "";
  const location = [address, city].filter(Boolean).join(", ");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-md border-red-100">
        <DialogHeader>
          <div className="flex items-start gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t("dashboard.deletePropertyTitle")}</DialogTitle>
              <DialogDescription className="mt-1">
                {t("dashboard.deletePropertyDescription")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-red-100 bg-red-50/70 p-3 text-sm text-red-700">
          {t("dashboard.deletePropertyWarning")}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-900">
            {property.name}
          </p>
          {location && (
            <p className="text-xs text-slate-600">{location}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(property)}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            {isLoading
              ? t("common.loading")
              : t("dashboard.deletePropertyConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePropertyModal;
