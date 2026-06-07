"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HiPaperAirplane, HiOutlineXMark } from "react-icons/hi2";
import { NotificationType, NotificationPriority, NotificationChannel } from "../notifications.types";
import type { CreateNotificationDto } from "../notifications.types";
import { useAdminSendNotification } from "../notifications.hooks";
import { toast } from "sonner";
import { useUsers } from "@/src/modules/user";

/* ─── Props ─── */

interface SendNotificationFormProps {
  onClose?: () => void;
}

/* ─── Component ─── */

export function SendNotificationForm({ onClose }: SendNotificationFormProps) {
  const [userId, setUserId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>(NotificationType.SYSTEM);
  const [priority, setPriority] = useState<NotificationPriority>(NotificationPriority.NORMAL);
  const [channel, setChannel] = useState<NotificationChannel>(NotificationChannel.IN_APP);
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: sendNotification, isPending } = useAdminSendNotification();
  const { data: usersPage } = useUsers({ page: "1", limit: "10" });

  const users = useMemo(() => usersPage?.data ?? [], [usersPage]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedUserId && !userId.trim()) newErrors.userId = "User ID is required";
    if (!title.trim()) newErrors.title = "Title is required";
    else if (title.length > 200) newErrors.title = "Title must be at most 200 characters";
    if (!body.trim()) newErrors.body = "Body is required";
    else if (body.length > 5000) newErrors.body = "Body must be at most 5000 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto: CreateNotificationDto = {
      userId: (selectedUserId ?? userId).trim(),
      type,
      title: title.trim(),
      body: body.trim(),
      priority,
      channel,
      link: link.trim() || undefined,
    };

    sendNotification(dto, {
      onSuccess: () => {
        toast.success("Notification sent successfully");
          setUserId("");
          setSelectedUserId(undefined);
        setTitle("");
        setBody("");
        setLink("");
        onClose?.();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to send notification");
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
        <h3 className="text-base font-semibold text-text-primary">Send Notification</h3>
        {onClose && (
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <HiOutlineXMark className="size-5" />
          </button>
        )}
      </div>

      {/* User ID */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Target User <span className="text-red-500">*</span></label>

        {/* Dropdown selector (first-page users) */}
        <div className="mb-2">
          <select
            aria-label="Select user"
            value={selectedUserId ?? ""}
            onChange={(e) => setSelectedUserId(e.target.value || undefined)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
          >
            <option value="">Select a user (or leave empty to paste UUID)</option>
            {users.map((u: any) => (
              <option key={u.id} value={String(u.id)}>
                {u.name ?? u.email}
              </option>
            ))}
          </select>
        </div>

        {/* Manual UUID fallback (kept for edge-cases) */}
        <input
          id="send-user-id"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Or paste target user UUID"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {errors.userId && <p className="mt-1 text-xs text-red-500">{errors.userId}</p>}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="send-title" className="block text-sm font-medium text-text-primary mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="send-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Body */}
      <div>
        <label htmlFor="send-body" className="block text-sm font-medium text-text-primary mb-1.5">
          Body <span className="text-red-500">*</span>
        </label>
        <textarea
          id="send-body"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notification message"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
        />
        {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body}</p>}
      </div>

      {/* Type, Priority, Channel Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Type */}
        <div>
          <label htmlFor="send-type" className="block text-sm font-medium text-text-primary mb-1.5">
            Type
          </label>
          <select
            id="send-type"
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

        {/* Priority */}
        <div>
          <label htmlFor="send-priority" className="block text-sm font-medium text-text-primary mb-1.5">
            Priority
          </label>
          <select
            id="send-priority"
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

        {/* Channel */}
        <div>
          <label htmlFor="send-channel" className="block text-sm font-medium text-text-primary mb-1.5">
            Channel
          </label>
          <select
            id="send-channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as NotificationChannel)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
          >
            {Object.values(NotificationChannel).map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Link (optional) */}
      <div>
        <label htmlFor="send-link" className="block text-sm font-medium text-text-primary mb-1.5">
          Link <span className="text-text-muted">(optional)</span>
        </label>
        <input
          id="send-link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 btn-shop disabled:opacity-50"
        >
          {isPending ? (
            <>
              <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <HiPaperAirplane className="size-4" />
              Send Notification
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
