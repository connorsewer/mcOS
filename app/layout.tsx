import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { ConvexClientProvider } from "@/components/convex-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCOS | Mission Control Operating System",
  description: "Command center for Ocean's 11 and Dune squads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}
      >
        <ConvexClientProvider>
          <TooltipProvider delayDuration={200}>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <NavBar />
            <main
              id="main-content"
              className="md:ml-16 pb-20 pb-safe md:pb-6"
            >
              <div className="container mx-auto px-4 py-6">
                {children}
              </div>
            </main>
            <Toaster />
          </TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
