import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import ClientLayout from "./_components/_global/ClientLayout";
import Navbar from "./_components/_global/Navbar";
import MobailSideBar from "./_components/_website/_navbar/MobileSidebar";
import { Toaster } from "sonner";
import { Footer } from "./_components/_website/_footer/footer";

import "./globals.css";

const RobotoFont = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
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
      <body className={`${RobotoFont.variable}  antialiased`}>
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
