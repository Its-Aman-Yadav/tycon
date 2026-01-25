import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "BabyStar AI - Future Baby Generator | Predict Your Future Child",
  description: "Predict your future baby's look with BabyStar AI. Using advanced vision neural networks and image generation, we blend parents' facial features to create a realistic preview of your child.",
  keywords: ["AI baby generator", "future baby predictor", "see my future child free", "professional vision model baby photo", "baby lookalike generator"],
  authors: [{ name: "Aman Yadav", url: "https://its-aman-yadav.web.app" }],
  creator: "Aman Yadav",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://babystar.ai",
    siteName: "BabyStar AI",
    title: "BabyStar AI - What will your baby look like?",
    description: "Upload parents' photos and get an AI-powered prediction of your future child in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BabyStar AI - Future Baby Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BabyStar AI - Future Baby Generator",
    description: "Predict your future child's look with advanced AI",
    images: ["/og-image.png"],
    creator: "@its_aman_yadav",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased bg-mesh min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
