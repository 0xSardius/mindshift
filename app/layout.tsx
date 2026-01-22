import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mindshiftai.xyz"),
  title: "Mindshift - Quit Negative Thinking",
  description:
    "Transform negative self-talk into empowering affirmations through AI-powered practice.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mindshift",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Mindshift - Quit Negative Thinking",
    description:
      "Transform negative self-talk into empowering affirmations through AI-powered practice.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Mindshift - Quit Negative Thinking",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindshift - Quit Negative Thinking",
    description:
      "Transform negative self-talk into empowering affirmations through AI-powered practice.",
    images: ["/social-card.png"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://mindshiftai.xyz/social-card.png",
    "fc:frame:button:1": "Try Mindshift",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://mindshiftai.xyz",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8f9fc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
