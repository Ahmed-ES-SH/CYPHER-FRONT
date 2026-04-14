"use client";
import { FooterLogo } from "./footer-logo";
import { FooterSocial } from "./footer-social";
import { BrandLinks } from "./brand-links";
import Img from "../../_global/Img";
import SubscribeSection from "../_home/SubscribeSection";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <SubscribeSection />
      <footer className="bg-background">
        <div className="container mx-auto px-4">
          {/* Top section: Logo + Social */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-8 gap-4">
            <FooterLogo />
            <FooterSocial />
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border-subtle)]" />

          {/* Brand links — categorized columns */}
          <div className="py-8">
            <BrandLinks />
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border-subtle)]" />

          {/* Bottom section: Copyright + Payment */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3">
            <p className="text-sm text-text-muted">
              Copyright {currentYear} &copy; CYPHER. All rights reserved.
            </p>
            <Img
              src="/images/payment.webp"
              alt="Accepted payment methods"
              className="w-[200px]"
            />
          </div>
        </div>
      </footer>
    </>
  );
}
