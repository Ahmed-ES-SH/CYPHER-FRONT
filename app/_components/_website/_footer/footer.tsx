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
      <footer className=" pb-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Bottom footer section */}
          <div className="pt-8 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-6">
              <FooterLogo />
              <FooterSocial />
            </div>

            {/* Brand links */}
            <div className="mb-8">
              <BrandLinks />
            </div>

            {/* Copyright and payment */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Copyright {currentYear} © CYPHER. All rights reserved. Powered
                by
                <span className="text-primary-blue px-2">Ahmed</span>.
              </p>
              <Img src="/images/payment.webp" className="w-[250px]" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
