import type { Metadata } from "next";

import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";

import { Inter, Tinos, Geist_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Madagou - The Modern real estate",
  description: "A list of top luxury House in cameroon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${tinos.className} antialiased`}>
        <Providers>
          {children}
          <Footer />
        </Providers>
        <Toaster closeButton />
      </body>
    </html>
  );
}
