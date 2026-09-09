import type { Metadata } from "next";
import { Antonio, Space_Grotesk } from "next/font/google";
import "./globals.css";
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
  title: "DOME CAFE",
  description: "India's first dome-shaped celebration café",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${antonio.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/images/birthday_v3.png" />
        <link rel="preload" as="image" href="/images/anniversary.png" />
        <link rel="preload" as="image" href="/images/babyshower_v3.png" />
        <link rel="preload" as="image" href="/images/celebrations.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
