import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mazala Firm — We make apps for mobile, web & desktop",
  description:
    "Mazala Firm conçoit des applications mobiles, web et desktop avec les dernières technologies et les meilleures pratiques.",
  icons: { icon: "/images/facebook.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
