import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ["latin"] });

// T089: Comprehensive SEO meta tags
export const metadata: Metadata = {
  title: {
    default: "Todo App - Manage Your Tasks Efficiently",
    template: "%s | Todo App",
  },
  description: "A modern, responsive todo application for managing your daily tasks efficiently. Create, organize, and track your tasks with an intuitive interface.",
  keywords: [
    "todo",
    "tasks",
    "productivity",
    "task management",
    "todo list",
    "task tracker",
    "organize tasks",
    "daily planner",
  ],
  authors: [{ name: "Todo App Team" }],
  creator: "Todo App Team",
  publisher: "Todo App",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://todo-app.example.com",
    title: "Todo App - Manage Your Tasks Efficiently",
    description: "A modern, responsive todo application for managing your daily tasks efficiently.",
    siteName: "Todo App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Todo App - Manage Your Tasks Efficiently",
    description: "A modern, responsive todo application for managing your daily tasks efficiently.",
    creator: "@todoapp",
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "productivity",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ErrorBoundary>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pt-16">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
