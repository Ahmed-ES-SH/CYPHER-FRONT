"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiMegaphone, HiOutlineXMark } from "react-icons/hi2";
import { NotificationType, NotificationPriority, NotificationChannel } from "../notifications.types";
import type { AdminBroadcastDto } from "../notifications.types";
import { useSendBroadcast, useAdminNotifications } from "../notifications.hooks";
import { validateAdminBroadcast } from "../notifications.api";
import { toast } from "sonner";

/* ─── Props ─── */

interface BroadcastNotificationFormProps {
  onClose?: () => void;
}

/* ─── Component ─── */

export function BroadcastNotificationForm({ onClose }: BroadcastNotificationFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>(NotificationType.ADMIN_BROADCAST);
  const [priority, setPriority] = useState<NotificationPriority>(NotificationPriority.NORMAL);
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>([NotificationChannel.IN_APP]);
  const [link, setLink] = useState("");
  const [userIds, setUserIds] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { mutate: broadcast, isPending } = useSendBroadcast();

  const toggleChannel = (channel: NotificationChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dto: AdminBroadcastDto = {
      title: title.trim(),
      body: body.trim(),
      type,
      priority,
      channels: selectedChannels,
      link: link.trim() || undefined,
      userIds: userIds.trim()
        ? userIds.split(",").map((u) => u.trim()).filter(Boolean)
        : undefined,
    };

    /* Client-side validation */
    const clientErrors = validateAdminBroadcast(dto);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});

    broadcast(dto, {
      onSuccess: (result) => {
        toast.success(
          `Broadcast sent! ${result.sent} delivered, ${result.failed} failed.`,
        );
        setTitle("");
        setBody("");
        setLink("");
        setUserIds("");
        setSelectedChannels([NotificationChannel.IN_APP]);
        onClose?.();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to send broadcast");
      },
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiMegaphone className="size-5 text-rose-500" />
          <h3 className="text-base font-semibold text-text-primary">Broadcast Announcement</h3>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <HiOutlineXMark className="size-5" />
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="broadcast-title" className="block text-sm font-medium text-text-primary mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="broadcast-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {fieldErrors.title && <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>}
      </div>

      {/* Body */}
      <div>
        <label htmlFor="broadcast-body" className="block text-sm font-medium text-text-primary mb-1.5">
          Body <span className="text-red-500">*</span>
        </label>
        <textarea
          id="broadcast-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Broadcast message content"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
        />
        {fieldErrors.body && <p className="mt-1 text-xs text-red-500">{fieldErrors.body}</p>}
      </div>

      {/* Type & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="broadcast-type" className="block text-sm font-medium text-text-primary mb-1.5">
            Type
          </label>
          <select
            id="broadcast-type"
            value={type}
            onChange={(e) => setType(e.target.value as NotificationType)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
          >
            {Object.values(NotificationType).map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="broadcast-priority" className="block text-sm font-medium text-text-primary mb-1.5">
            Priority
          </label>
          <select
            id="broadcast-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as NotificationPriority)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
          >
            {Object.values(NotificationPriority).map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Channels */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">
          Channels <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.values(NotificationChannel).map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => toggleChannel(ch)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  selectedChannels.includes(ch)
                    ? "bg-primary-blue text-white shadow-sm"
                    : "bg-surface text-text-secondary border border-border-subtle hover:border-primary"
                }
              `}
            >
              {ch.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
        {fieldErrors.channels && <p className="mt-1 text-xs text-red-500">{fieldErrors.channels}</p>}
      </div>

      {/* Link (optional) */}
      <div>
        <label htmlFor="broadcast-link" className="block text-sm font-medium text-text-primary mb-1.5">
          Link <span className="text-text-muted">(optional)</span>
        </label>
        <input
          id="broadcast-link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* Target User IDs (optional) */}
      <div>
        <label htmlFor="broadcast-user-ids" className="block text-sm font-medium text-text-primary mb-1.5">
          Target Users <span className="text-text-muted">(optional, comma-separated UUIDs)</span>
        </label>
        <textarea
          id="broadcast-user-ids"
          rows={2}
          value={userIds}
          onChange={(e) => setUserIds(e.target.value)}
          placeholder="user-id-1, user-id-2, ... (leave empty for all users)"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Broadcasting...
            </>
          ) : (
            <>
              <HiMegaphone className="size-4" />
              Send Broadcast
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
