"use client";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavbarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  console.log(pathname);

  if (pathname == "/reset-password") return null;
  return <div>{children}</div>;
}
