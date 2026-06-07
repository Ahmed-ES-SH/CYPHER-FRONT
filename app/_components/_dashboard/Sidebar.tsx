"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiUsers, FiBox, FiCreditCard, FiBell, FiBook, FiHelpCircle, FiLogOut } from "react-icons/fi";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard/overview", icon: FiHome },
  { label: "Users", href: "/dashboard/users", icon: FiUsers },
  { label: "Products", href: "/dashboard/products", icon: FiBox },
  { label: "Payments", href: "/dashboard/payments", icon: FiCreditCard },
  { label: "Blog", href: "/dashboard/blog", icon: FiBook },
  { label: "Notifications", href: "/dashboard/notifications", icon: FiBell },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/dashboard/overview") return pathname === href;
  return pathname.startsWith(href + "/") || pathname === href;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-elevated border-r border-border-subtle flex-col py-8 px-6 z-50">
      <div className="mb-8">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-display font-bold text-text-primary">CYPHER</span>
          <p className="text-xs text-text-secondary mt-0.5">Electronics Retail</p>
        </Link>
      </div>

      <nav className="flex-1" aria-label="Main navigation">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 ${
                    active
                      ? "bg-primary-blue/10 text-primary-blue font-semibold"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  }`}
                >
                  <Icon className="size-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <ul className="flex flex-col gap-1 mt-auto pt-6 border-t border-border-subtle">
        <li>
          <Link
            href="/dashboard/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
          >
            <FiHelpCircle className="size-5 shrink-0" />
            <span>Help</span>
          </Link>
        </li>
        <li>
          <button
            type="button"
            aria-label="Sign out of your account"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
          >
            <FiLogOut className="size-5 shrink-0" />
            <span>Sign out</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}
