import type { PusherConfig } from "./notifications.types";

export const NOTIFICATION_PAGE_SIZE = 20;
export const NOTIFICATION_STALE_TIME = 30 * 1000;
export const NOTIFICATION_GC_TIME = 5 * 60 * 1000;
export const NOTIFICATION_RETRY = 1;
export const POLL_INTERVAL = 15 * 1000;

export function getPusherConfigFromEnv(): PusherConfig {
  return {
    appKey: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
    channel: process.env.NEXT_PUBLIC_PUSHER_CHANNEL ?? "private-notifications",
    authEndpoint: "/api/pusher/auth",
  };
}

export const DEFAULT_PUSHER_CONFIG: PusherConfig = {
  appKey: "",
  cluster: "",
  channel: "private-notifications",
};

export function validatePusherConfig(config: Partial<PusherConfig>): string[] {
  const errors: string[] = [];
  if (!config.appKey) errors.push("Pusher app key is required");
  if (!config.cluster) errors.push("Pusher cluster is required");
  if (!config.channel) errors.push("Pusher channel is required");
  return errors;
}
