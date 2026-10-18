import type { Metadata, Viewport } from "next";
import PwaRegister from "@/components/PwaRegister";
import ThemePicker from "@/components/ThemePicker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mazala Firm — We make apps for mobile, web & desktop",
  description:
    "Mazala Firm conçoit des applications mobiles, web et desktop avec les dernières technologies et les meilleures pratiques.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Mazala",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#D97706",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applique le thème choisi avant le premier rendu — évite le flash de la palette par défaut */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("mz-theme");if(t&&t!=="marine")document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <ThemePicker />
        <PwaRegister />
      </body>
    </html>
  );
}
