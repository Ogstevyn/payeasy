import "../lib/env";
import type { Metadata } from "next";
<<<<<<< HEAD
import { ThemeProvider } from "@/lib/theme/provider";
=======
>>>>>>> 02ac1b5 (feat: Implement client-side and server-side route protection with a new auth provider, protected route component, and middleware enhancements.)
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { ErrorProvider } from "@/components/providers/ErrorProvider";
import NextTopLoader from "nextjs-toploader";
import WalletProvider from "@/providers/WalletProvider";
import AuthProvider from "@/providers/AuthProvider";
import FavoritesProvider from "@/components/FavoritesProvider";
import ComparisonProvider from "@/components/ComparisonProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastSystem } from "@/components/ToastSystem";
import dynamic from "next/dynamic";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import "@fontsource-variable/inter";
import { ThemeProvider } from "@/lib/theme/provider";
import ProtectedRoute from "@/components/protectedRoute";
import { ThemeProvider } from "@/lib/theme/provider";
import ProtectedRoute from "@/components/protectedRoute";

// Dynamically import ComparisonBar to reduce initial bundle size
const ComparisonBar = dynamic(() => import("@/components/ComparisonBar"), {
  ssr: false,
  loading: () => null, // Don't show anything while loading
});
export const metadata: Metadata = {
  title: "PayEasy | Shared Rent on Stellar",
  description: "Secure, blockchain-powered rent sharing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Plus Jakarta Sans — display/brand headings */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global error boundary - wraps everything inside ThemeProvider */}
          <ErrorProvider>
            <ProtectedRoute>
            <ProtectedRoute>
            {/* Loading bar at the top */}
            <NextTopLoader color="#7D00FF" showSpinner={false} />


            {/* Analytics tracking */}
            <AnalyticsTracker />

            {/* Core providers */}
            <ServiceWorkerProvider>
              <WalletProvider>
                <AuthProvider>
                  <FavoritesProvider>
                    <ComparisonProvider>
                      <NotificationProvider>
                        {/* Header - visible on all pages */}
                        <Header sticky isAuthenticated userName="User" />

                        {/* Sidebar - app-wide navigation */}
                        <Sidebar />
                        <ToastProvider>
                          {children}
                          <ComparisonBar />
                          <NotificationCenter />
                          <ToastSystem />
                        </ToastProvider>
                      </NotificationProvider>
                    </ComparisonProvider>
                  </FavoritesProvider>
                </AuthProvider>
              </WalletProvider>
            </ServiceWorkerProvider>

            {/* Toast notifications with theme-aware styling */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
                success: {
                  style: {
                    background: "hsl(var(--success))",
                    color: "hsl(var(--success-foreground))",
                  },
                },
                error: {
                  style: {
                    background: "hsl(var(--destructive))",
                    color: "hsl(var(--destructive-foreground))",
                  },
                },
              }}
            />
              </ProtectedRoute>
              </ProtectedRoute>
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
