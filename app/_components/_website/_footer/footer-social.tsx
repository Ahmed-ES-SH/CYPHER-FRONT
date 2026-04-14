"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaTwitch,
} from "react-icons/fa";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--border-subtle)] text-[var(--icon-color)] hover:bg-primary hover:text-white transition-colors duration-200"
    >
      {icon}
    </Link>
  );
}

export function FooterSocial() {
  return (
    <nav aria-label="Social media links" className="flex gap-3">
      <SocialLink
        href="https://facebook.com"
        icon={<FaFacebookF size={16} />}
        label="Facebook"
      />
      <SocialLink
        href="https://twitter.com"
        icon={<FaTwitter size={16} />}
        label="Twitter"
      />
      <SocialLink
        href="https://linkedin.com"
        icon={<FaLinkedinIn size={16} />}
        label="LinkedIn"
      />
      <SocialLink
        href="https://youtube.com"
        icon={<FaYoutube size={16} />}
        label="YouTube"
      />
      <SocialLink
        href="https://instagram.com"
        icon={<FaInstagram size={16} />}
        label="Instagram"
      />
      <SocialLink
        href="https://twitch.tv"
        icon={<FaTwitch size={16} />}
        label="Twitch"
      />
    </nav>
  );
}
