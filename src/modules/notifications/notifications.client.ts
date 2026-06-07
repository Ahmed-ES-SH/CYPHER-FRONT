"use client";

import type { PusherConfig } from "./notifications.types";
import { validatePusherConfig, getPusherConfigFromEnv } from "./notifications.config";

export type PusherEventHandler = (data: unknown) => void;

export interface PusherClient {
  subscribe(channel: string, event: string, handler: PusherEventHandler): () => void;
  disconnect(): void;
  readonly isConnected: boolean;
}

let clientInstance: PusherClient | null = null;
let activeConfig: PusherConfig | null = null;
let rawPusherInstance: unknown = null;

const channelRefs = new Map<string, { count: number }>();

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

export function getRawPusherInstance(): unknown {
  return rawPusherInstance;
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

    rawPusherInstance = pusher;

    clientInstance = {
      subscribe: (channelName: string, event: string, handler: PusherEventHandler) => {
        if (!channelRefs.has(channelName)) {
          channelRefs.set(channelName, { count: 0 });
        }
        const ref = channelRefs.get(channelName)!;
        ref.count++;

        const ch = pusher.subscribe(channelName);
        ch.bind(event, handler);

        return () => {
          ch.unbind(event, handler);
          ref.count--;
          if (ref.count <= 0) {
            pusher.unsubscribe(channelName);
            channelRefs.delete(channelName);
          }
        };
      },
      disconnect: () => {
        pusher.disconnect();
        clientInstance = null;
        rawPusherInstance = null;
        channelRefs.clear();
      },
      get isConnected() {
        return pusher.connection.state === "connected";
      },
    };
  } catch {
    clientInstance = null;
    rawPusherInstance = null;
  }

  return clientInstance;
}

export function resetPusherClient(): void {
  if (clientInstance) {
    clientInstance.disconnect();
  }
  clientInstance = null;
  rawPusherInstance = null;
  activeConfig = null;
  channelRefs.clear();
}
