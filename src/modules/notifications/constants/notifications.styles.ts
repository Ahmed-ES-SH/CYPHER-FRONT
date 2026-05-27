import { NotificationType, NotificationPriority } from "../notifications.types";

/* ─── Border Colors by Type ─── */

export const typeBorderColors: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: "border-l-blue-500",
  [NotificationType.PAYMENT_RECEIVED]: "border-l-emerald-500",
  [NotificationType.PAYMENT_FAILED]: "border-l-red-500",
  [NotificationType.SHIPPING_UPDATE]: "border-l-cyan-500",
  [NotificationType.ACCOUNT_UPDATE]: "border-l-violet-500",
  [NotificationType.PROMOTIONAL]: "border-l-amber-500",
  [NotificationType.ADMIN_BROADCAST]: "border-l-rose-500",
  [NotificationType.SYSTEM]: "border-l-slate-400",
};

/* ─── Background Tint by Type ─── */

export const typeBgColors: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: "bg-blue-50/50",
  [NotificationType.PAYMENT_RECEIVED]: "bg-emerald-50/50",
  [NotificationType.PAYMENT_FAILED]: "bg-red-50/50",
  [NotificationType.SHIPPING_UPDATE]: "bg-cyan-50/50",
  [NotificationType.ACCOUNT_UPDATE]: "bg-violet-50/50",
  [NotificationType.PROMOTIONAL]: "bg-amber-50/50",
  [NotificationType.ADMIN_BROADCAST]: "bg-rose-50/50",
  [NotificationType.SYSTEM]: "bg-slate-50/50",
};

/* ─── Icon Colors by Type ─── */

export const typeIconColors: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: "text-blue-600",
  [NotificationType.PAYMENT_RECEIVED]: "text-emerald-600",
  [NotificationType.PAYMENT_FAILED]: "text-red-600",
  [NotificationType.SHIPPING_UPDATE]: "text-cyan-600",
  [NotificationType.ACCOUNT_UPDATE]: "text-violet-600",
  [NotificationType.PROMOTIONAL]: "text-amber-600",
  [NotificationType.ADMIN_BROADCAST]: "text-rose-600",
  [NotificationType.SYSTEM]: "text-slate-500",
};

/* ─── Priority Badge Styles ─── */

export const priorityBadgeStyles: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: "bg-slate-100 text-slate-600",
  [NotificationPriority.NORMAL]: "bg-blue-100 text-blue-700",
  [NotificationPriority.HIGH]: "bg-orange-100 text-orange-700",
  [NotificationPriority.URGENT]: "bg-red-100 text-red-700",
};

/* ─── Priority Dot Colors ─── */

export const priorityDotColors: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: "bg-slate-400",
  [NotificationPriority.NORMAL]: "bg-blue-500",
  [NotificationPriority.HIGH]: "bg-orange-500",
  [NotificationPriority.URGENT]: "bg-red-500",
};
