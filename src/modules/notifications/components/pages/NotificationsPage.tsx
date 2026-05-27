"use client";

import { useState } from "react";
import { useNotifications, useMarkAsRead } from "../../notifications.hooks";
import type { Notification } from "../../notifications.types";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications({ page, limit: 20 });
  const { mutate: markAsRead } = useMarkAsRead();

  const handleMarkRead = (id: string) => {
    markAsRead({ ids: [id] });
  };

  const handleMarkAllRead = () => {
    markAsRead({ all: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const notifications = data?.data ?? [];
  const unreadTotal = data?.unread?.total ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadTotal > 0 && (
            <p className="text-sm text-muted-foreground">{unreadTotal} unread</p>
          )}
        </div>
        {unreadTotal > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">No notifications</h2>
          <p className="text-muted-foreground">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 flex items-start gap-3 ${
                !notification.isRead ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-medium truncate ${!notification.isRead ? "text-primary" : ""}`}>
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="shrink-0 text-xs text-muted-foreground hover:text-primary whitespace-nowrap"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {notification.link && (
                    <a href={notification.link} className="text-xs text-primary hover:underline">
                      View details
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border rounded disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
