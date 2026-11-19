"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "success" | "default";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="h-6 w-6 text-rose-600" />;
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
      default:
        return <Info className="h-6 w-6 text-sky-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 p-2">{getIcon()}</div>
          <DialogTitle>{title}</DialogTitle>
        </div>
      </DialogHeader>
      <div className="py-3">
        <DialogDescription className="text-sm text-slate-600 leading-relaxed">
          {description}
        </DialogDescription>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : variant === "success" ? "success" : "default"}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
          disabled={isLoading}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
