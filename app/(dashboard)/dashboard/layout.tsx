import React from "react";
import Sidebar from "@/app/_components/_dashboard/Sidebar";
import Topbar from "@/app/_components/_dashboard/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Fixed desktop sidebar */}
      <Sidebar />

      {/* Main wrapper — offset on large screens to avoid the fixed sidebar */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-8  mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
