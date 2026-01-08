import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider, type UserProfile } from "@/context/AuthContext";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

import { GlobalErrorBoundary as ErrorBoundary } from "@/components/GlobalErrorBoundary";
import { ShadowHijacker } from "@/components/debug/DiagnosticOverlay";

import { createClient } from "@/utils/supabase/server";


const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: 'swap',
});

import { Amiri, Cinzel } from "next/font/google"; // Import Amiri and Cinzel

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

// --- SEO & VIEWPORT ---
export const viewport: Viewport = {
  themeColor: '#2563EB', // Electric Blue
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Brainy | بوابة النخبة الأكاديمية",
    template: "%s | Brainy",
  },
  description: "رحلة سينمائية نحو النجاح في البكالوريا.",
  keywords: ["brainy", "bac dz", "bac algeria", "تعليم", "بكالوريا", "دروس", "منصة تعليمية"],
  authors: [{ name: "Brainy Team" }],
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "https://brainy-dz.vercel.app",
    siteName: "Brainy",
    title: "Brainy - منصة التفوق الأكاديمي",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية ذكية.",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brainy - منصة التفوق الأكاديمي",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية ذكية.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- SERVER AUTOPSY: Catch and expose any server-side errors ---
  let initialUser = null;
  let initialProfile: UserProfile | null = null;
  let AUTOPSY_ERROR: { message: string; stack?: string; name: string } | null = null;

  try {
    // --- SERVER AUTH HYDRATION (SUPABASE) ---
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(`[SUPABASE AUTH] ${userError.message}`);
    }

    if (user) {
      initialUser = user;

      // Try fetch profile for role
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found, which is OK
        throw new Error(`[SUPABASE PROFILE] ${profileError.message} (Code: ${profileError.code})`);
      }

      if (profile) {
        initialProfile = {
          id: user.id,
          email: user.email || '',
          full_name: profile.full_name || user.user_metadata?.full_name || '',
          // wilaya: undefined, // Let it be undefined or fetch if needed
          // major: undefined,
          role: profile.role || 'student',
          is_profile_complete: profile.is_profile_complete || false,
          created_at: profile.created_at || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    // Capture the server error for display
    const err = error as Error;
    AUTOPSY_ERROR = {
      message: err.message || 'Unknown server error',
      stack: err.stack,
      name: err.name || 'Error'
    };
    console.error('[SERVER AUTOPSY] 🔴 CAUGHT ERROR:', AUTOPSY_ERROR);
  }

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.variable} ${playfairDisplay.variable} ${amiri.variable} ${cinzel.variable} antialiased bg-background text-foreground font-sans selection:bg-primary/30`}>
        {/* NextTopLoader DISABLED - testing router deadlock */}
        <AuthProvider initialUser={initialUser} hydratedProfile={initialProfile}>
          {/* 🔴 SERVER AUTOPSY: Display any caught server errors */}
          {AUTOPSY_ERROR && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 99999,
              background: 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 100%)',
              border: '2px solid #ff4444',
              padding: '20px',
              fontFamily: 'system-ui, sans-serif',
              color: '#ffffff',
              maxHeight: '50vh',
              overflow: 'auto'
            }}>
              <h1 style={{ color: '#ff6666', marginBottom: '10px', fontSize: '24px' }}>
                🔴 SERVER AUTOPSY - ERROR DETECTED
              </h1>
              <div style={{
                background: '#000000',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #ff4444'
              }}>
                <div style={{ color: '#ff9999', fontWeight: 'bold', marginBottom: '5px' }}>
                  ERROR NAME: <span style={{ color: '#ffffff' }}>{AUTOPSY_ERROR.name}</span>
                </div>
                <div style={{ color: '#ff9999', fontWeight: 'bold', marginBottom: '10px' }}>
                  MESSAGE: <span style={{ color: '#ffff00', fontSize: '18px' }}>{AUTOPSY_ERROR.message}</span>
                </div>
                {AUTOPSY_ERROR.stack && (
                  <details open>
                    <summary style={{ color: '#ff6666', cursor: 'pointer', marginBottom: '10px' }}>
                      STACK TRACE (click to expand)
                    </summary>
                    <pre style={{
                      color: '#aaaaaa',
                      fontSize: '11px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      background: '#111111',
                      padding: '10px',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {AUTOPSY_ERROR.stack}
                    </pre>
                  </details>
                )}
              </div>
              <div style={{ color: '#888888', fontSize: '12px' }}>
                This error was caught in <code>src/app/layout.tsx</code> server component.
                Check your Supabase environment variables and database schema.
              </div>
            </div>
          )}
          <ErrorBoundary>
            {children}
            <Toaster
              position="bottom-center"
              richColors
              theme="dark"
              toastOptions={{
                className: "glass-panel text-foreground font-sans",
                style: {
                  fontFamily: 'var(--font-sans)',
                  background: 'rgba(10, 10, 15, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFF'
                }
              }}
            />
          </ErrorBoundary>
          <ShadowHijacker />
        </AuthProvider>
      </body>
    </html>
  );
}

