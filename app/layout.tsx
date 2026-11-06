import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Red_Hat_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LoadingOverlayProvider } from "@/components/providers/loading-overlay-provider";
import { NavigationLoading } from "@/components/providers/navigation-loading";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { UpdateProvider } from "@/components/providers/update-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const cifraMono = Red_Hat_Mono({
  variable: "--font-cifra-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tom Certo",
  description: "Cifras, letras e repertórios do ministério de música",
  appleWebApp: {
    capable: true,
    title: "Tom Certo",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f4" },
    { media: "(prefers-color-scheme: dark)", color: "#11141b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${grotesk.variable} ${cifraMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LoadingOverlayProvider>
            {children}
            <Suspense fallback={null}>
              <NavigationLoading />
            </Suspense>
            <PwaProvider />
            <UpdateProvider />
            <Toaster />
          </LoadingOverlayProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
