import React from "react";
import Link from "next/link";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export default function Page() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={`min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-slate-50 to-[#EBF3FF] font-sans text-slate-900 ${ibmPlexArabic.variable}`}
    >
      {/* Tiny Soft Background Orbs (Depth) */}
      <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-indigo-300/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-32 h-32 bg-sky-200/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header - Logo Only */}
      <header className="relative z-10 pt-10 px-8 md:px-24 flex justify-between items-center">
        <h1 className="text-4xl font-black tracking-tighter">
          bac<span className="text-blue-600">X</span>
        </h1>
      </header>

      {/* Main Content - Spacious & Artistic */}
      <main className="relative z-10 mx-auto max-w-[1600px] w-full min-h-[calc(100vh-120px)] grid lg:grid-cols-2 gap-20 xl:gap-40 items-center px-8 md:px-24 py-16">

        {/* Right Column: Hero Section */}
        <div className="order-1 flex flex-col justify-center space-y-12 lg:space-y-16 py-10">
          <div className="space-y-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              حضّر للبكالوريا...
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-500">
                وافتح باب مستقبلك.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-loose max-w-xl">
              منصة bacX هي بوصلتك نحو النجاح، توفر لك كل ما تحتاجه من دروس وتمارين ومتابعة لتختصر الطريق نحو التميز.
            </p>
          </div>

          {/* New Relocated Buttons */}
          <div className="flex flex-wrap gap-6 items-center">
            {/* Primary Button: Glowing Blue Gradient */}
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-5 rounded-full font-bold text-lg shadow-[0_10px_40px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_60px_-10px_rgba(37,99,235,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              إنشاء حساب
            </Link>

            {/* Secondary Button: Ghost Style with Border */}
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center bg-transparent border-2 border-slate-200 text-slate-600 px-12 py-5 rounded-full font-bold text-lg hover:border-blue-400 hover:text-blue-600 transition-colors duration-300"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Left Column: Floating Poem with Ornamentation */}
        <div className="order-2 relative flex items-center justify-center lg:justify-end py-10">

          {/* Subtle Arabic Ornamentation Watermark (SVG) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] opacity-[0.03] pointer-events-none select-none">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" className="w-full h-full text-slate-900" strokeWidth="0.5">
              <circle cx="100" cy="100" r="80" />
              <rect x="43.5" y="43.5" width="113" height="113" transform="rotate(45 100 100)" />
              <rect x="43.5" y="43.5" width="113" height="113" />
              <path d="M100 20 L100 180 M20 100 L180 100" />
            </svg>
          </div>

          {/* Poem Text - Floating & Elegant */}
          <div className="relative z-10 text-center space-y-12">
            <div className="space-y-8 text-slate-800 text-2xl md:text-3xl font-medium leading-[2.6] font-serif md:font-sans">
              <div>
                <p className="opacity-90">ومَا الحيَاةُ سِوى حُلمٍ ألمَّ بنَا</p>
                <p className="text-xl md:text-2xl text-slate-500 mt-2">قد مَرَّ كالحُلمِ سَاعَاتِي وأيَّامِي</p>
              </div>

              {/* Decorative Divider */}
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto opacity-60"></div>

              <div>
                <p className="opacity-90">فِي مِثلِ غَمضَةِ عَينٍ وانتبَاهتِها</p>
                <p className="text-xl md:text-2xl text-slate-500 mt-2">قدْ أصبحَ الطِّفلُ شيخًا أبيضَ الهَامِ</p>
              </div>
            </div>

            <div className="max-w-md mx-auto relative pt-12">
              <div className="w-16 h-px bg-slate-300 mx-auto mb-8"></div>
              <p className="text-slate-500 text-lg leading-loose italic">
                "لا زِلتُ أتذكّر... كأنَّ البارحةَ كانَت... واليومَ جئتُ لأقول لكم: لا تُضيّعوا وقتكم، فخطوةٌ واحدةٌ صادقةٌ قد تصنعُ لكم عمرًا كاملًا."
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
