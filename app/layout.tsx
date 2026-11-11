import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Sidebar from "@/components/shell/Sidebar";
import BottomNav from "@/components/shell/BottomNav";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "EduTok · learn how the best startups are built",
  description: "Swipe through short explainers on the engineering behind great startups, or ask the AI studio to make clips about any concept.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex h-[calc(100dvh-var(--nav-h))] w-full overflow-hidden">
            <Sidebar />
            <main className="relative min-w-0 flex-1">{children}</main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
