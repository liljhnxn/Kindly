import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Kindly | Small Requests. Real Help.",
  description:
    "An on-chain community mutual aid platform on Botchain Testnet where people request help with small tasks and others volunteer to assist them.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-ivory-50 text-charcoal-900 antialiased selection:bg-forest-100 selection:text-forest-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

