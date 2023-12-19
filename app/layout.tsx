import { ThemeProvider } from "@/app/_components/providers/theme-provider";
import { createOgImageUrl } from "@/app/api/og/og-functions";
import { Provider } from "jotai";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Rubik } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" });

export const metadata: Metadata = {
  title: { default: "Parth Kabra", template: "%s - Parth Kabra" },
  description:
    "Parth Kabra, a software engineer, and data scientist at Northeastern University, interested in product engineering and creating amazing user interfaces",
  openGraph: {
    images: [{ url: createOgImageUrl() }],
    url: "https://parthkabra.me",
    type: "profile",
  },
  // viewport: {

  // }
  // themeColor: "#000000",
  metadataBase: new URL("https://parthkabra.me"),
};

export function generateViewport() {
  return {
    themeColor: "#000000",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} ${rubik.variable} font-sans h-full text-foreground dark:text-foreground`}
      >
        <Provider>
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
