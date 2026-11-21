import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { OfflineState } from "@/components/ui/offline-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";

describe("UI State Components Tests", () => {
  describe("ErrorState Component", () => {
    it("renders title, message and executes retry callback", () => {
      const onRetry = vi.fn();
      render(
        <ErrorState
          title="Server Connection Lost"
          message="Could not reach admin gateway (502 Bad Gateway)"
          onRetry={onRetry}
        />
      );

      expect(screen.getByText("Server Connection Lost")).toBeInTheDocument();
      expect(
        screen.getByText("Could not reach admin gateway (502 Bad Gateway)")
      ).toBeInTheDocument();

      const retryBtn = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("EmptyState Component", () => {
    it("renders title, description and triggers optional action button", () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No Reports in Queue"
          description="All flagged listings and reels have been reviewed."
          actionLabel="Refresh List"
          onAction={onAction}
        />
      );

      expect(screen.getByText("No Reports in Queue")).toBeInTheDocument();
      expect(
        screen.getByText("All flagged listings and reels have been reviewed.")
      ).toBeInTheDocument();

      const actionBtn = screen.getByRole("button", { name: /refresh list/i });
      fireEvent.click(actionBtn);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("OfflineState Component", () => {
    it("renders offline warning and handles retry button click", () => {
      const onRetry = vi.fn();
      render(<OfflineState onRetry={onRetry} />);

      expect(screen.getByText("No Internet Connection")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /retry connection/i });
      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("ConfirmModal Destructive Confirmation Component", () => {
    it("renders confirmation prompt, executes onConfirm, and handles cancellation", () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <ConfirmModal
          open={true}
          onOpenChange={onOpenChange}
          title="Deactivate Staff Account?"
          description="Are you sure you want to deactivate this administrator? This action is logged to audit trail."
          confirmLabel="Yes, Deactivate"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText("Deactivate Staff Account?")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to deactivate/i)
      ).toBeInTheDocument();

      // Click Confirm
      const confirmBtn = screen.getByRole("button", { name: /yes, deactivate/i });
      fireEvent.click(confirmBtn);
      expect(onConfirm).toHaveBeenCalledTimes(1);

      // Click Cancel
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
