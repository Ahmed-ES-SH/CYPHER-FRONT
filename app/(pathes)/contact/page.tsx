import ContactSection from "@/app/_components/_website/contact/ContactSection";
import React from "react";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="c-container pt-16 pb-8">
        <div id="main-title" className="flex flex-col gap-4 items-start max-w-3xl">
          <span className="text-primary-blue font-bold tracking-wider uppercase text-sm">
            Support Center
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-dark-btn leading-tight">
            How can we <span className="font-bold">help you today?</span>
          </h1>
          <p className="text-lg text-icon-color max-w-2xl leading-relaxed">
            Whether you have a question about a product, need technical support, or want to visit one of our flagship experience centers, our team of tech experts is ready to assist.
          </p>
        </div>
        <ContactSection />
      </div>
    </div>
  );
}
