import type { Metadata } from "next";
import { Antonio, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "APECHAIN",
  description: "The Place to Ape",
};

const isSanityConfigured = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDraftMode = (await draftMode()).isEnabled;

  return (
    <html
      lang="en"
      className={`${antonio.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/images/birthday_v3.png" />
        <link rel="preload" as="image" href="/images/anniversary.png" />
        <link rel="preload" as="image" href="/images/genderreveal_v2.png" />
        <link rel="preload" as="image" href="/images/celebrations.png" />
      </head>
      <body>
        {children}
        {isSanityConfigured && <SanityLive />}
        {isSanityConfigured && isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
