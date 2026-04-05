/**
 * Generates shared metadata for the CYPHER E-commerce platform.
 * Includes OpenGraph and Twitter cards for better social sharing.
 */
export const getSharedMetadata = (title: string, description: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const logoUrl = `${baseUrl}/logo.png`;

  return {
    // title + description
    title,
    description,

    // 1. Keywords optimization for E-commerce
    keywords: [
      "CYPHER",
      "Cypher Store",
      "online shopping",
      "ecommerce platform",
      "best deals",
      "تسوق أونلاين",
      "متجر سايفر",
      "عروض حصرية",
      "أفضل المنتجات",
      "شراء عبر الإنترنت",
    ],

    // 2. OpenGraph (Facebook, WhatsApp, LinkedIn, etc.)
    openGraph: {
      title: `${title} | CYPHER`,
      description: description,
      url: `${baseUrl}`,
      siteName: "CYPHER Store",
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: "CYPHER Store - Premium Shopping Experience",
        },
      ],
      type: "website",
      locale: "en_US",
    },

    // 4. Verification & Icons (Optional but recommended)
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
};
