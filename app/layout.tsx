import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import ClientLayout from "./_components/_global/ClientLayout";
import Navbar from "./_components/_global/Navbar";
import MobailSideBar from "./_components/_website/_navbar/MobileSidebar";
import { Toaster } from "sonner";
import { Footer } from "./_components/_website/_footer/footer";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CYPHER – Electronics Store ECommerce",
  description:
    "Shop the latest smartphones, laptops, and electronic accessories at CYPHER. Premium quality, exclusive deals, and fast, secure shipping.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <ClientLayout>
          <Navbar />
          <MobailSideBar />
          <Toaster closeButton richColors position="top-center" />
          {children}
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}
