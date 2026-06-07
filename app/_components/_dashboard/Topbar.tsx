"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiBell, FiSettings } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import Img from "@/app/_components/_global/Img";

export default function Topbar() {
  const [openSettings, setOpenSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpenSettings(false), []);

  useEffect(() => {
    if (!openSettings) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    const clickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("keydown", handler);
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [openSettings, close]);

  return (
    <header className="w-full h-16 sticky top-0 bg-surface-elevated border-b border-border-subtle z-40 flex items-center px-6">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="text-text-muted">Dashboard</span>
        <span className="text-text-muted">/</span>
        <span className="font-medium text-text-primary">Overview</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors text-text-muted" aria-label="Notifications">
          <FiBell />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="relative">
          <button
            ref={triggerRef}
            onClick={() => setOpenSettings((s) => !s)}
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-text-muted"
            aria-expanded={openSettings}
            aria-haspopup="true"
            aria-label="Settings"
          >
            <FiSettings />
          </button>

          <AnimatePresence>
            {openSettings && (
              <motion.div
                ref={menuRef}
                role="menu"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="absolute right-0 mt-2 w-44 bg-surface-elevated border border-border-subtle rounded-lg p-2"
              >
                <button role="menuitem" className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-surface-container-low rounded transition-colors">Profile</button>
                <button role="menuitem" className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-surface-container-low rounded transition-colors">Preferences</button>
                <div className="h-px bg-border-subtle my-1" />
                <button role="menuitem" className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-surface-container-low rounded transition-colors">Sign out</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-border-subtle" />

        <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle">
          <Img src="/images/user.png" alt="avatar" width={32} height={32} className="size-full object-cover" />
        </div>
      </div>
    </header>
  );
}
