import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { BackendStatusProvider } from "@/context/BackendStatusProvider";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import GlobalProgressBar from "@/components/ui/GlobalProgressBar";
import ConnectionOverlay from "@/components/backend/ConnectionOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trishul CRM - Role-Based AI Intelligence Platform",
  description: "Next-generation CRM for enterprise management, AI recommendations, and team productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark suppressHydrationWarning">
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <BackendStatusProvider>
            <AuthProvider>
              <LoadingProvider>
                <GlobalProgressBar />
                <ConnectionOverlay />
                {children}
              </LoadingProvider>
            </AuthProvider>
          </BackendStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
