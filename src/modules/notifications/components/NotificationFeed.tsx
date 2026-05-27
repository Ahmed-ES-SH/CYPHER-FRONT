"use client";

import { AnimatePresence } from "framer-motion";
import { HiOutlineBellAlert, HiCheck } from "react-icons/hi2";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "../notifications.types";
import { SkeletonNotificationFeed } from "./SkeletonNotificationFeed";

interface NotificationFeedProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

export function NotificationFeed({
  notifications,
  unreadCount,
  isLoading,
  isError,
  error,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onRefresh,
}: NotificationFeedProps) {
  /* Loading State */
  if (isLoading) {
    return <SkeletonNotificationFeed count={5} />;
  }

  /* Error State */
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-red-50 p-4 mb-4">
          <HiOutlineBellAlert className="size-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Failed to load notifications</h3>
        <p className="text-sm text-text-muted max-w-sm mb-6">
          {error?.message ?? "Something went wrong. Please try again."}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-shop text-sm"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  /* Empty State */
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="rounded-full bg-surface p-5 mb-5 ring-1 ring-border-subtle">
          <HiOutlineBellAlert className="size-10 text-text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-1">All caught up!</h3>
        <p className="text-sm text-text-muted max-w-xs">
          You have no notifications right now. We&apos;ll let you know when something new arrives.
        </p>
      </div>
    );
  }

  /* Normal State */
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-primary text-white text-xs font-medium px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-blue transition-colors"
          >
            <HiCheck className="size-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
