import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin-ext"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mievhomebandirma.com"),
  title: "Miev Home Bandırma | Züccaciye & Ev Ürünleri Mağazası",
  description:
    "Bandırma’da züccaciye, mutfak ürünleri, cam, porselen, dekoratif ev ürünleri ve kampanyalı ürünleri Miev Home mağazasında keşfedin.",
  openGraph: {
    title: "Miev Home Bandırma | Züccaciye & Ev Ürünleri Mağazası",
    description:
      "Bandırma’da züccaciye, mutfak ürünleri, cam, porselen, dekoratif ev ürünleri ve kampanyalı ürünleri Miev Home mağazasında keşfedin.",
    url: "https://mievhomebandirma.com",
    siteName: "Miev Home Bandırma",
    locale: "tr_TR",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
