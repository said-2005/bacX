import type { Metadata, Viewport } from "next";
import { Inter, Tajawal } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { BackButton } from "@/components/ui/BackButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
  display: 'swap',
});

// --- SEO & VIEWPORT ---
export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "BacX - منصة النخبة التعليمية",
    template: "%s | BacX",
  },
  description: "المنصة التعليمية الأولى لطلاب البكالوريا في الجزائر. تجربة دراسية سينمائية تجمع بين التقنية المتقدمة والمحتوى الأكاديمي الرصين.",
  keywords: ["bac dz", "bac algeria", "تعليم", "بكالوريا", "دروس", "منصة تعليمية"],
  authors: [{ name: "BacX Team" }],
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "https://bacx-dz.vercel.app",
    siteName: "BacX",
    title: "BacX - منصة النخبة التعليمية",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية متطورة.",
    images: [
      {
        url: "/og-image.jpg", // Needs to be added to public folder
        width: 1200,
        height: 630,
        alt: "BacX Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BacX - منصة النخبة التعليمية",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية متطورة.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${tajawal.variable} antialiased bg-[#050505] text-[#EDEDED]`}>
        <NextTopLoader
          color="#2997FF"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2997FF,0 0 5px #2997FF"
        />
        <AuthProvider>
          <ErrorBoundary>
            <BackButton />
            {children}
            <Toaster
              position="bottom-center"
              richColors
              theme="dark"
              toastOptions={{
                style: {
                  background: 'rgba(10, 10, 10, 0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#EDEDED',
                  fontFamily: 'var(--font-tajawal)',
                }
              }}
            />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
