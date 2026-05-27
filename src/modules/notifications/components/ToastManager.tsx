"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { Notification } from "../notifications.types";
import { useRealtimeNotifications } from "../notifications.hooks";

interface ToastManagerProps {
  enabled?: boolean;
}

export function ToastManager({ enabled = true }: ToastManagerProps) {
  useRealtimeNotifications(enabled);

  return null;
}

function getToastVariant(notification: Notification) {
  switch (notification.priority) {
    case "urgent":
      return "error";
    case "high":
      return "warning";
    default:
      return "info";
  }
}

export function showNotificationToast(notification: Notification) {
  const variant = getToastVariant(notification);

  if (notification.link) {
    toast(variant === "error" ? "Error" : variant === "warning" ? "Warning" : "Info", {
      description: notification.title,
      action: {
        label: "View",
        onClick: () => {
          window.location.href = notification.link!;
        },
      },
    });
    return;
  }

  toast(notification.title, {
    description: notification.body,
  });
}
