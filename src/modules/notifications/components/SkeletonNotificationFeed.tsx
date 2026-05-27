"use client";

import { motion } from "framer-motion";

/* ─── Single Skeleton Item ─── */

export function SkeletonNotificationItem() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle p-4 animate-pulse">
      <div className="shrink-0 size-10 rounded-lg bg-gray-200" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 bg-gray-200 rounded w-3/5" />
          <div className="h-3 bg-gray-200 rounded w-12 shrink-0" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
}

/* ─── Feed Skeleton ─── */

interface SkeletonNotificationFeedProps {
  count?: number;
}

export function SkeletonNotificationFeed({ count = 5 }: SkeletonNotificationFeedProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
        >
          <SkeletonNotificationItem />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Badge Skeleton ─── */

export function SkeletonNotificationBadge() {
  return (
    <div className="size-10 rounded-full bg-gray-100 animate-pulse ring-1 ring-border-subtle" />
  );
}

/* ─── Preferences Skeleton ─── */

export function SkeletonNotificationPreferences() {
  return (
    <div className="space-y-3">
      <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-72 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-border-subtle p-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-48" />
            </div>
          </div>
          <div className="size-6 rounded-full bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
