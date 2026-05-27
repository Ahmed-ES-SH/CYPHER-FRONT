"use client";

import type { PusherConfig } from "./notifications.types";
import { validatePusherConfig, getPusherConfigFromEnv } from "./notifications.config";

export type PusherEventHandler = (data: unknown) => void;

export interface PusherClient {
  subscribe(channel: string, event: string, handler: PusherEventHandler): () => void;
  disconnect(): void;
  isConnected: boolean;
}

let clientInstance: PusherClient | null = null;
let activeConfig: PusherConfig | null = null;

function loadConfig(): PusherConfig | null {
  if (activeConfig) return activeConfig;

  const envConfig = getPusherConfigFromEnv();
  const errors = validatePusherConfig(envConfig);
  if (errors.length > 0) return null;

  activeConfig = envConfig;
  return activeConfig;
}

export function configurePusher(config: PusherConfig): string[] {
  const errors = validatePusherConfig(config);
  if (errors.length > 0) return errors;

  activeConfig = config;
  return [];
}

export function isPusherConfigured(): boolean {
  return loadConfig() !== null;
}

export function getPusherClient(): PusherClient | null {
  if (clientInstance) return clientInstance;

  const config = loadConfig();
  if (!config) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PusherModule = require("pusher-js");
    const PusherConstructor = PusherModule.default ?? PusherModule;
    const pusher = new PusherConstructor(config.appKey, {
      cluster: config.cluster,
      authEndpoint: config.authEndpoint ?? "/api/pusher/auth",
      disableStats: true,
    });

    clientInstance = {
      subscribe: (channel: string, event: string, handler: PusherEventHandler) => {
        const ch = pusher.subscribe(channel);
        ch.bind(event, handler);
        return () => {
          ch.unbind(event, handler);
          pusher.unsubscribe(channel);
        };
      },
      disconnect: () => {
        pusher.disconnect();
        clientInstance = null;
      },
      isConnected: pusher.connection.state === "connected",
    };
  } catch {
    clientInstance = null;
  }

  return clientInstance;
}

export function resetPusherClient(): void {
  if (clientInstance) {
    clientInstance.disconnect();
  }
  clientInstance = null;
  activeConfig = null;
}
