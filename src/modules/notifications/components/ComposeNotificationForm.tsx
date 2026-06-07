"use client";

import { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi2";
import { toast } from "sonner";
import { useAdminSendNotification, useSendBroadcast } from "../notifications.hooks";
import { NotificationType, NotificationPriority, NotificationChannel } from "../notifications.types";

interface Props {
  recipients: string[];
  onClose?: () => void;
}

export default function ComposeNotificationForm({ recipients, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: sendNotification, isPending: isSending } = useAdminSendNotification();
  const { mutate: broadcast, isPending: isBroadcasting } = useSendBroadcast();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!body.trim()) errs.body = "Body is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!recipients || recipients.length === 0) {
      toast.error("No recipients selected");
      return;
    }

    if (recipients.length === 1) {
      // single send
      sendNotification(
        {
          userId: String(recipients[0]),
          type: NotificationType.SYSTEM,
          title: title.trim(),
          body: body.trim(),
          priority: NotificationPriority.NORMAL,
          channel: NotificationChannel.IN_APP,
          link: link.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Notification sent");
            setTitle("");
            setBody("");
            setLink("");
            onClose?.();
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to send");
          },
        },
      );
    } else {
      // multi - use broadcast endpoint
      broadcast(
        {
          title: title.trim(),
          body: body.trim(),
          type: NotificationType.ADMIN_BROADCAST,
          priority: NotificationPriority.NORMAL,
          channels: [NotificationChannel.IN_APP],
          userIds: recipients,
          link: link.trim() || undefined,
        },
        {
          onSuccess: (res) => {
            toast.success(`Broadcast sent! ${res.sent} delivered`);
            setTitle("");
            setBody("");
            setLink("");
            onClose?.();
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to broadcast");
          },
        },
      );
    }
  };

  const loading = isSending || isBroadcasting;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Compose</h3>
        <p className="text-sm text-text-muted">Targeting {recipients.length} selected user(s)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Notification Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., System Update Alert"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Message Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Enter the main notification content..."
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm resize-none"
        />
        {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Target Link/Action (Optional)</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://"
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center justify-end">
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg">
          {loading ? "Sending..." : (<><HiPaperAirplane className="size-4" /> Send Notification</>)}
        </button>
      </div>
    </form>
  );
}
