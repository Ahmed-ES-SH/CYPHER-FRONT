"use client";
import { useAuthStore, userType } from "@/app/store/useAuthStore";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function NavbarWrapper({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: userType;
}) {
  const setUser = useAuthStore((state) => state.setUser);
  const pathname = usePathname();

  useEffect(() => {
    if (currentUser) setUser(currentUser);
  }, [currentUser]);

  if (pathname == "/reset-password" || pathname == "/auth/callback")
    return null;
  return <div>{children}</div>;
}
