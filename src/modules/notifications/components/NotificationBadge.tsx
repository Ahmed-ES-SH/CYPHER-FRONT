"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineBell } from "react-icons/hi2";
import { useUnreadCount } from "../notifications.hooks";
import { SkeletonNotificationBadge } from "./SkeletonNotificationFeed";

interface NotificationBadgeProps {
  onClick?: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { data: unreadData, isLoading } = useUnreadCount();
  const count = unreadData?.total ?? 0;

  if (isLoading) {
    return <SkeletonNotificationBadge />;
  }

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center size-10 rounded-full bg-surface hover:bg-surface-elevated transition-colors ring-1 ring-border-subtle"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
    >
      <HiOutlineBell className="size-5 text-icon-color" />

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
