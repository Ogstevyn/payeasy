"use client";

import { ToastContainer } from "@/components/Toast";
import { useContext } from "react";
import { ToastContext } from "@/contexts/ToastContext";

/**
 * Toast system renderer
 * Must be used within ToastProvider
 */
export function ToastSystem() {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  return (
    <ToastContainer
      toasts={context.toasts}
      onDismiss={context.dismissToast}
      position="bottom-right"
    />
  );
}
