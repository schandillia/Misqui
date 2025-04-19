import type { Metadata } from "next";
import meta from "@/lib/data/meta.json";
import { bodyFont, headingFont } from "@/lib/fonts";

import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: meta.HOME.TITLE,
  description: meta.HOME.DESCRIPTION,
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(bodyFont.variable, headingFont.variable)}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
