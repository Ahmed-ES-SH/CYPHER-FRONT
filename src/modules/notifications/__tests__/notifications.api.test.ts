import { describe, it, expect } from "vitest";
import {
  validateAdminBroadcast,
  normalizeNotificationError,
  parseValidationErrors,
  buildNotificationQueryParams,
  toNotification,
  notificationKeys,
} from "../notifications.api";
import { NotificationType, NotificationPriority, NotificationChannel } from "../notifications.types";

describe("validateAdminBroadcast", () => {
  const valid = {
    title: "Test Broadcast",
    body: "This is a test broadcast message",
    type: NotificationType.SYSTEM as const,
    priority: NotificationPriority.NORMAL as const,
    channels: [NotificationChannel.IN_APP as const],
  };

  it("returns empty errors for valid input", () => {
    expect(validateAdminBroadcast(valid)).toEqual({});
  });

  it("requires title", () => {
    const errs = validateAdminBroadcast({ ...valid, title: "" });
    expect(errs.title).toBeDefined();
  });

  it("rejects title exceeding 200 chars", () => {
    const errs = validateAdminBroadcast({ ...valid, title: "A".repeat(201) });
    expect(errs.title).toContain("200");
  });

  it("requires body", () => {
    const errs = validateAdminBroadcast({ ...valid, body: "" });
    expect(errs.body).toBeDefined();
  });

  it("rejects body exceeding 5000 chars", () => {
    const errs = validateAdminBroadcast({ ...valid, body: "A".repeat(5001) });
    expect(errs.body).toContain("5000");
  });

  it("requires at least one channel", () => {
    const errs = validateAdminBroadcast({ ...valid, channels: [] });
    expect(errs.channels).toBeDefined();
  });
});

describe("normalizeNotificationError", () => {
  it("extracts message and status", () => {
    const result = normalizeNotificationError({ message: "Not found", status: 404 });
    expect(result).toEqual({ message: "Not found", status: 404 });
  });

  it("returns defaults for null", () => {
    const result = normalizeNotificationError(null);
    expect(result.message).toBe("An unexpected error occurred");
    expect(result.status).toBe(500);
  });
});

describe("parseValidationErrors", () => {
  it("converts field arrays to first-message map", () => {
    const result = parseValidationErrors({ title: ["Title is required"] });
    expect(result).toEqual({ title: "Title is required" });
  });

  it("returns empty object when no errors", () => {
    expect(parseValidationErrors(undefined)).toEqual({});
  });
});

describe("buildNotificationQueryParams", () => {
  it("returns default params", () => {
    const qs = buildNotificationQueryParams({});
    expect(qs).toContain("page=1");
    expect(qs).toContain("limit=20");
  });

  it("includes optional filters", () => {
    const qs = buildNotificationQueryParams({
      type: NotificationType.ORDER_UPDATE,
      isRead: false,
      sortBy: "createdAt",
      order: "DESC",
    });
    expect(qs).toContain("type=order_update");
    expect(qs).toContain("isRead=false");
    expect(qs).toContain("sortBy=createdAt");
    expect(qs).toContain("order=DESC");
  });
});

describe("toNotification", () => {
  it("maps camelCase API response", () => {
    const raw = {
      id: "notif-1",
      userId: "usr-1",
      type: "order_update",
      title: "Order Shipped",
      body: "Your order ORD-001 has been shipped",
      data: { orderId: "ord-1" },
      link: "/orders/ord-1",
      priority: "normal",
      channel: "in_app",
      isRead: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toNotification(raw);
    expect(result.title).toBe("Order Shipped");
    expect(result.type).toBe("order_update");
    expect(result.data?.orderId).toBe("ord-1");
    expect(result.link).toBe("/orders/ord-1");
    expect(result.isRead).toBe(false);
  });

  it("maps snake_case API response", () => {
    const raw = {
      id: "notif-2",
      user_id: "usr-2",
      type: "system",
      title: "Welcome",
      body: "Welcome to the platform",
      is_read: true,
      read_at: "2026-02-01T00:00:00.000Z",
      created_at: "2026-02-01T00:00:00.000Z",
      updated_at: "2026-02-01T00:00:00.000Z",
    };
    const result = toNotification(raw);
    expect(result.title).toBe("Welcome");
    expect(result.isRead).toBe(true);
    expect(result.readAt).toBe("2026-02-01T00:00:00.000Z");
  });

  it("defaults missing optional fields", () => {
    const raw = { id: "n-1", userId: "u-1", title: "Test", body: "Body", createdAt: "", updatedAt: "" };
    const result = toNotification(raw);
    expect(result.data).toBeUndefined();
    expect(result.link).toBeUndefined();
    expect(result.image).toBeUndefined();
    expect(result.readAt).toBeUndefined();
  });
});

describe("notificationKeys", () => {
  it("produces all, list, detail, unread, preferences prefixes", () => {
    expect(notificationKeys.all).toEqual(["notifications"]);
    expect(notificationKeys.lists()).toEqual(["notifications", "list"]);
    expect(notificationKeys.details()).toEqual(["notifications", "detail"]);
    expect(notificationKeys.unread()).toEqual(["notifications", "unread"]);
    expect(notificationKeys.preferences()).toEqual(["notifications", "preferences"]);
  });

  it("produces detail key with id", () => {
    expect(notificationKeys.detail("n-1")).toEqual(["notifications", "detail", "n-1"]);
  });

  it("includes params in list keys", () => {
    const key = notificationKeys.list({ page: 1, limit: 20 });
    expect(key[0]).toBe("notifications");
    expect(key[1]).toBe("list");
  });
});
