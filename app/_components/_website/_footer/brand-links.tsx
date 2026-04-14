"use client";
import Link from "next/link";

interface BrandLinkItemProps {
  href: string;
  children: React.ReactNode;
}

function BrandLinkItem({ href, children }: BrandLinkItemProps) {
  return (
    <Link
      href={href}
      className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

interface BrandCategoryProps {
  title: string;
  links: { name: string; href: string }[];
}

function BrandCategory({ title, links }: BrandCategoryProps) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h4>
      <ul className="flex flex-col gap-1.5">
        {links.map((link) => (
          <li key={link.name}>
            <BrandLinkItem href={link.href}>{link.name}</BrandLinkItem>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrandLinks() {
  const categories = [
    {
      title: "Apple",
      links: [
        { name: "MacBook Pro M1", href: "/macbook-pro-m1" },
        { name: "iMac", href: "/imac" },
        { name: "iPad", href: "/ipad" },
        { name: "iPad Mini", href: "/ipad-mini" },
        { name: "iPad 4 16GB", href: "/ipad-4-16gb" },
        { name: "Apple Watch", href: "/apple-watch" },
        { name: "Beats", href: "/beats" },
      ],
    },
    {
      title: "Samsung",
      links: [
        { name: "Samsung Galaxy S5 64GB", href: "/samsung-galaxy-s5" },
        { name: "Samsung Galaxy M31", href: "/samsung-galaxy-m31" },
        { name: "Samsung Galaxy M11", href: "/samsung-galaxy-m11" },
        { name: "Samsung Galaxy Tab 4", href: "/samsung-galaxy-tab-4" },
      ],
    },
    {
      title: "Accessories",
      links: [
        { name: "Wireless Speaker", href: "/wireless-speaker" },
        { name: "Camera", href: "/camera" },
        { name: "Keyboard", href: "/keyboard" },
        { name: "Mouse", href: "/mouse" },
        { name: "Game Controller", href: "/game-controller" },
        { name: "HD Monitors", href: "/hd" },
      ],
    },
    {
      title: "Other Brands",
      links: [
        { name: "Lenovo", href: "/lenovo" },
        { name: "HTC One", href: "/htc-one" },
        { name: "HTC M8", href: "/m8" },
      ],
    },
  ];

  return (
    <nav aria-label="Browse by brand" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
      {categories.map((category) => (
        <BrandCategory key={category.title} title={category.title} links={category.links} />
      ))}
    </nav>
  );
}
