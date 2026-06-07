"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineBell, HiOutlineCheckCircle } from "react-icons/hi2";
import { InfiniteNotificationFeed } from "./InfiniteNotificationFeed";
import { NotificationPreferencesCard as NotificationPreferences } from "./NotificationPreferences";
import { useMarkAsRead, useMarkAllAsRead, useAdminDeleteNotification } from "../notifications.hooks";
import { toast } from "sonner";

/* ─── Tabs ─── */

type Tab = "all" | "preferences";

/* ─── Component ─── */

export function UserNotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useAdminDeleteNotification();

  const handleMarkRead = (id: string) => {
    markAsRead(
      { ids: [id] },
      {
        onSuccess: () => toast.success("Marked as read"),
        onError: () => toast.error("Failed to mark as read"),
      },
    );
  };

  const handleMarkAllRead = () => {
    markAllAsRead(undefined, {
      onSuccess: (data) => {
        toast.success(`${data.modified} notification${data.modified !== 1 ? "s" : ""} marked as read`);
      },
      onError: () => toast.error("Failed to mark all as read"),
    });
  };

  const handleDelete = (id: string) => {
    toast("Delete this notification?", {
      action: {
        label: "Delete",
        onClick: () => {
          deleteNotification(id, {
            onSuccess: () => toast.success("Notification deleted"),
            onError: (err) => toast.error(err.message || "Failed to delete"),
          });
        },
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-text-primary tracking-tight"
        >
          Notifications
        </motion.h1>
        <p className="mt-1 text-sm text-text-muted">
          Stay updated with your orders, payments, and account activity.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface rounded-xl ring-1 ring-border-subtle w-fit">
        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          <HiOutlineBell className="size-4" />
          All
        </TabButton>
        <TabButton active={activeTab === "preferences"} onClick={() => setActiveTab("preferences")}>
          <HiOutlineCheckCircle className="size-4" />
          Preferences
        </TabButton>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "all" && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <InfiniteNotificationFeed
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDelete}
            />
          </motion.div>
        )}

        {activeTab === "preferences" && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <NotificationPreferences />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Tab Button Sub-component ─── */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${active ? "bg-surface-elevated shadow-sm text-text-primary" : "text-text-muted hover:text-text-secondary"}
      `}
    >
      {children}
    </button>
  );
}
