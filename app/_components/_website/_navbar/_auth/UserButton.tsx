"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiLayout,
  FiLogOut,
  FiLoader,
  FiChevronDown,
} from "react-icons/fi";

import Img from "@/app/_components/_global/Img";
import { useAuth, useLogout, AUTH_ROUTES } from "@/src/modules/auth";
import { useClickOutside } from "@/app/hooks/useClickOutside";

export function UserButton() {
  const { user } = useAuth();
  const { logout, isLoading: isLoggingOut } = useLogout();

  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleLogout = async () => {
    try {
      await logout();
      router.push(AUTH_ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeOut" as const },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" as const },
    },
  };

  return (
    <div className="relative shrink-0 z-9999" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors group focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="User avatar"
              width={40}
              height={40}
              className="size-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all shadow-sm"
            />
          ) : (
            <div className="size-10 flex items-center justify-center bg-primary text-white rounded-full  border-2 border-transparent group-hover:border-primary transition-all shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="hidden sm:flex flex-col items-start mr-1">
          <span className="text-sm font-semibold truncate max-w-[100px]">
            {user?.name}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-none">
            {user?.role == "user" ? "Member" : "Admin"}
          </span>
        </div>
        <FiChevronDown
          className={`hidden sm:block text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: "250px" }}
            className="absolute -right-2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right backdrop-blur-sm bg-opacity-95"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">
                Account
              </p>
              <p className="text-sm font-bold truncate">{user?.email}</p>
            </div>

            {/* main options */}
            <div className="p-2 flex flex-col gap-4">
              {/* User Dashboard */}
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex hover:translate-x-2 duration-300 items-center gap-3 px-3 rounded-xl text-gray-700 w-full group"
              >
                <div className="p-2 rounded-lg bg-gray-100">
                  <FiUser className="size-4" />
                </div>
                <span className="font-medium text-sm group-hover:text-primary transition-colors duration-200">
                  User Dashboard
                </span>
              </Link>

              {/* Admin Dashboard */}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex hover:translate-x-2 items-center gap-3 px-3 group rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-purple-100 transition-colors">
                    <FiLayout className="size-4" />
                  </div>
                  <span className="font-medium text-sm duration-300 group-hover:text-primary">
                    Admin Dashboard
                  </span>
                </Link>
              )}
            </div>

            {/* Logout Section */}
            <div className="p-2 border-t border-gray-100">
              <button
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                    {isLoggingOut ? (
                      <FiLoader className="size-4 animate-spin" />
                    ) : (
                      <FiLogOut className="size-4" />
                    )}
                  </div>
                  <span className="font-medium text-sm">
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
