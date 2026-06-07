"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineBellAlert } from "react-icons/hi2";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "../notifications.hooks";
import { SkeletonNotificationPreferences } from "./SkeletonNotificationFeed";
import { toast } from "sonner";
import { NotificationChannel } from "../notifications.types";

/* ─── Channel Display Config ─── */

interface ChannelConfig {
  key: NotificationChannel;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const channelConfigs: ChannelConfig[] = [
  {
    key: NotificationChannel.IN_APP,
    label: "In-App Notifications",
    description: "Receive notifications inside the application.",
    icon: <HiOutlineBell className="size-5" />,
  },
  {
    key: NotificationChannel.EMAIL,
    label: "Email Notifications",
    description: "Receive notifications via email.",
    icon: <HiOutlineBellAlert className="size-5" />,
  },
  {
    key: NotificationChannel.PUSH,
    label: "Push Notifications",
    description: "Receive push notifications on your device.",
    icon: <HiOutlineCheckCircle className="size-5" />,
  },
  {
    key: NotificationChannel.SMS,
    label: "SMS Notifications",
    description: "Receive notifications via SMS.",
    icon: <HiOutlineBellAlert className="size-5" />,
  },
];

/* ─── Component ─── */

export function NotificationPreferencesCard() {
  const { data: preferences, isLoading, isError } = useNotificationPreferences();
  const { mutate: updatePreferences, isPending } = useUpdateNotificationPreferences();

  const handleToggle = (channelKey: NotificationChannel) => {
    if (!preferences) return;
    updatePreferences(
      {
        [channelKey]: {
          ...preferences[channelKey],
          enabled: !preferences[channelKey]?.enabled,
        },
      },
      {
        onSuccess: () => {
          toast.success("Preferences updated");
        },
        onError: () => {
          toast.error("Failed to update preferences");
        },
      },
    );
  };

  if (isLoading) {
    return <SkeletonNotificationPreferences />;
  }

  if (isError || !preferences) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">Failed to load preferences. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Notification Preferences</h3>
      <p className="text-sm text-text-muted mb-6">
        Choose how you&apos;d like to receive notifications.
      </p>

      <div className="space-y-3">
        {channelConfigs.map((channel) => {
          const channelPref = preferences[channel.key];
          const isEnabled = channelPref?.enabled ?? false;

          return (
            <motion.div
              key={channel.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`
                flex items-center justify-between rounded-xl border p-4 transition-all duration-200
                ${
                  isEnabled
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border-subtle bg-surface"
                }
              `}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`shrink-0 rounded-lg p-2 ${
                    isEnabled ? "bg-primary/10 text-primary" : "bg-surface text-text-muted"
                  }`}
                >
                  {channel.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{channel.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{channel.description}</p>
                </div>
              </div>

              <button
                role="switch"
                aria-checked={isEnabled}
                aria-label={`${channel.label} — ${isEnabled ? "enabled" : "disabled"}`}
                onClick={() => handleToggle(channel.key)}
                disabled={isPending}
                className={`
                  relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
                  border-2 border-transparent transition-colors duration-200
                  focus-visible:outline-2 focus-visible:outline-primary
                  ${isEnabled ? "bg-primary-blue" : "bg-gray-200"}
                  ${isPending ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block size-5 rounded-full bg-white shadow
                    transform transition-transform duration-200
                    ${isEnabled ? "translate-x-5" : "translate-x-0"}
                  `}
                />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
