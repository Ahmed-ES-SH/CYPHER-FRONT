"use client";

import { motion } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineCreditCard,
  HiOutlineExclamationCircle,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineMegaphone,
  HiOutlineBell,
  HiOutlineTag,
  HiCheck,
  HiTrash,
} from "react-icons/hi2";
import type { Notification } from "../notifications.types";
import { NotificationType } from "../notifications.types";
import {
  typeBorderColors,
  typeBgColors,
  typeIconColors,
  priorityDotColors,
} from "../constants/notifications.styles";

/* ─── Type Icon Map ─── */

const typeIcons: Record<NotificationType, React.ReactNode> = {
  [NotificationType.ORDER_UPDATE]: <HiOutlineShoppingBag className="size-5" />,
  [NotificationType.PAYMENT_RECEIVED]: <HiOutlineCreditCard className="size-5" />,
  [NotificationType.PAYMENT_FAILED]: <HiOutlineExclamationCircle className="size-5" />,
  [NotificationType.SHIPPING_UPDATE]: <HiOutlineTruck className="size-5" />,
  [NotificationType.ACCOUNT_UPDATE]: <HiOutlineUser className="size-5" />,
  [NotificationType.PROMOTIONAL]: <HiOutlineTag className="size-5" />,
  [NotificationType.ADMIN_BROADCAST]: <HiOutlineMegaphone className="size-5" />,
  [NotificationType.SYSTEM]: <HiOutlineBell className="size-5" />,
};

/* ─── Helpers ─── */

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Props ─── */

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/* ─── Component ─── */

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const isUnread = !notification.isRead;
  const borderColor = typeBorderColors[notification.type] ?? "border-l-slate-400";
  const bgColor = typeBgColors[notification.type] ?? "bg-slate-50/50";
  const iconColor = typeIconColors[notification.type] ?? "text-slate-500";
  const dotColor = priorityDotColors[notification.priority] ?? "bg-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`
        group relative flex items-start gap-3 rounded-xl border border-border-subtle
        border-l-4 ${borderColor} p-4 transition-all duration-200
        hover:shadow-md hover:border-l-4
        ${isUnread ? `${bgColor} shadow-sm` : "bg-surface-elevated"}
      `}
    >
      {/* Priority dot indicator */}
      <span
        className={`absolute top-3 right-3 size-2 rounded-full ${dotColor} ${isUnread ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      />

      {/* Type icon */}
      <div className={`shrink-0 rounded-lg p-2 ${isUnread ? "bg-white/80 shadow-sm" : "bg-surface"} ${iconColor}`}>
        {typeIcons[notification.type] ?? <HiOutlineBell className="size-5" />}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`truncate text-sm font-medium ${
              isUnread ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-text-muted whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p className="mt-1 text-sm text-text-secondary line-clamp-2">{notification.body}</p>

        {/* Actions row */}
        <div className="mt-3 flex items-center gap-3">
          {isUnread && onMarkRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-blue transition-colors"
              aria-label="Mark as read"
            >
              <HiCheck className="size-3.5" />
              Mark read
            </button>
          )}

          {notification.link && (
            <a
              href={notification.link}
              className="inline-flex items-center text-xs font-medium text-primary hover:text-primary-blue transition-colors"
            >
              View details
            </a>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-red-500 transition-colors ml-auto"
              aria-label="Delete notification"
            >
              <HiTrash className="size-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
