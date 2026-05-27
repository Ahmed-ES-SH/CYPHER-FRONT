"use client";

import { useRef, useEffect, useCallback } from "react";
import { NotificationFeed } from "./NotificationFeed";
import { SkeletonNotificationFeed } from "./SkeletonNotificationFeed";
import type { Notification, NotificationCursorQueryParams } from "../notifications.types";
import { useInfiniteNotifications } from "../notifications.hooks";

interface InfiniteNotificationFeedProps {
  params?: NotificationCursorQueryParams;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete?: (id: string) => void;
}

export function InfiniteNotificationFeed({
  params = {},
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: InfiniteNotificationFeedProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteNotifications(params);

  const sentinelRef = useRef<HTMLDivElement>(null);

  /* IntersectionObserver to trigger next page fetch */
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  /* Flatten pages */
  const notifications: Notification[] = data?.pages.flatMap((page) => page.data) ?? [];
  const unreadCount = 0; // Cursor pages don't include unread count; handled separately

  return (
    <div className="space-y-3">
      <NotificationFeed
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
        onDelete={onDelete}
        onRefresh={() => refetch()}
      />

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Loading more...
          </div>
        </div>
      )}

      {/* End of list */}
      {!hasNextPage && notifications.length > 0 && (
        <p className="text-center text-sm text-text-muted py-6">
          You&apos;ve reached the end
        </p>
      )}
    </div>
  );
}
