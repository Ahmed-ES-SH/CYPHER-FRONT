"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineTrash,
  HiOutlineBell,
  HiOutlineMegaphone,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { useAdminNotifications, useAdminDeleteNotification } from "../notifications.hooks";
import { NotificationType } from "../notifications.types";
import type { Notification, AdminNotificationQueryParams } from "../notifications.types";
import { SendNotificationForm } from "./SendNotificationForm";
import { BroadcastNotificationForm } from "./BroadcastNotificationForm";
import { SkeletonNotificationFeed } from "./SkeletonNotificationFeed";
import { toast } from "sonner";

/* ─── Component ─── */

export function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSendForm, setShowSendForm] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  const filters: AdminNotificationQueryParams = {
    page,
    limit: 15,
    ...(typeFilter && { type: typeFilter as NotificationType }),
  };

  const { data, isLoading, isError, error, refetch } = useAdminNotifications(filters);
  const { mutate: deleteNotification, isPending: isDeleting } = useAdminDeleteNotification();

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = (notification: Notification) => {
    if (!window.confirm(`Delete notification "${notification.title}"? This cannot be undone.`)) return;
    deleteNotification(notification.id, {
      onSuccess: () => toast.success("Notification deleted"),
      onError: (err) => toast.error(err.message || "Failed to delete"),
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    /* TODO: Enable search once the backend supports a `search` query parameter */
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Send, broadcast, and manage all notifications across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowSendForm(!showSendForm);
              setShowBroadcastForm(false);
            }}
            className="inline-flex items-center gap-2 btn-shop text-sm"
          >
            <HiOutlineBell className="size-4" />
            Send
          </button>
          <button
            onClick={() => {
              setShowBroadcastForm(!showBroadcastForm);
              setShowSendForm(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors"
          >
            <HiOutlineMegaphone className="size-4" />
            Broadcast
          </button>
        </div>
      </div>

      {/* Send / Broadcast Forms (toggle) */}
      <AnimatePresence>
        {showSendForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SendNotificationForm onClose={() => setShowSendForm(false)} />
          </motion.div>
        )}
        {showBroadcastForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BroadcastNotificationForm onClose={() => setShowBroadcastForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-subtle text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <button type="submit" className="btn-shop text-sm px-4 py-2">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="size-4 text-text-muted" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as NotificationType | "");
              setPage(1);
            }}
            className="rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
          >
            <option value="">All Types</option>
            {Object.values(NotificationType).map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonNotificationFeed count={5} />
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load notifications</p>
          <p className="text-sm text-red-400 mt-1">{error?.message}</p>
          <button onClick={() => refetch()} className="mt-4 btn-shop text-sm">
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface p-12 text-center">
          <HiOutlineBell className="size-10 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No notifications found</h3>
          <p className="text-sm text-text-muted">
            {typeFilter ? "No notifications match the selected type filter." : "No notifications have been sent yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Priority</th>
                  <th className="text-left px-4 py-3 font-medium">Read</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="bg-surface-elevated hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="truncate font-medium text-text-primary">{notification.title}</p>
                      <p className="truncate text-text-muted text-xs mt-0.5">{notification.body}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-text-secondary">
                        {notification.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-text-muted font-mono" title={notification.userId}>
                        {notification.userId.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          notification.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : notification.priority === "high"
                              ? "bg-orange-100 text-orange-700"
                              : notification.priority === "normal"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {notification.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {notification.isRead ? (
                        <span className="text-xs text-emerald-600 font-medium">Read</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Unread</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-text-muted">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(notification)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <HiOutlineTrash className="size-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-subtle text-sm font-medium hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <HiOutlineChevronLeft className="size-4" />
            Previous
          </button>
          <span className="text-sm text-text-secondary">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= meta.totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-subtle text-sm font-medium hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <HiOutlineChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
