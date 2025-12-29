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
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/40 font-sans text-slate-900 ${ibmPlexArabic.variable}`}
    >
      {/* Background Ambience - Replicating soft glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Header - Logo Top Right */}
      <header className="relative z-20 pt-8 px-6 md:px-20 max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[2.5rem] font-bold tracking-tight text-slate-800">
            bac<span className="text-blue-600">X</span>
          </h1>
          <div className="w-8 h-8 md:w-10 md:h-10 text-blue-600">
            {/* Simple Book Icon as per reference suggestion or logo placeholder */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 mx-auto max-w-[1400px] min-h-[calc(100vh-100px)] w-full px-6 md:px-20 pt-10 pb-0 flex flex-col justify-between">

        {/* Upper Section: Text (Right) & Card (Left) */}
        <div className="grid lg:grid-cols-12 gap-10 items-start lg:items-center">

          {/* Right Side: Headline & Buttons (Span 7) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-8 pt-10 lg:pt-0">
            <h2 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold text-slate-900 leading-[1.15] tracking-tight">
              حضِّر للبكالوريا بثقة
              <div className="h-2 md:h-4"></div>
              <span className="text-slate-900">
                وافتح باب مستقبلك
              </span>
            </h2>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link
                href="/auth?mode=login"
                className="bg-[#125CA6] text-white px-10 py-3.5 rounded-full font-bold text-lg shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-transform active:scale-95"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth?mode=signup"
                className="bg-transparent border border-slate-300 text-slate-600 px-10 py-3.5 rounded-full font-bold text-lg hover:border-slate-400 hover:text-slate-800 transition-colors"
              >
                تسجيل حساب
              </Link>
            </div>
          </div>

          {/* Left Side: Poem Card (Span 5) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="relative w-[340px] md:w-[380px] bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.08)] border border-white/60">
              {/* Card Content */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              {/* Decorative top element */}
              <div className="flex justify-center mb-6 opacity-40">
                <svg width="40" height="10" viewBox="0 0 40 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 5H40" stroke="#94A3B8" strokeWidth="1" />
                  <circle cx="20" cy="5" r="3" fill="#94A3B8" />
                </svg>
              </div>

              <div className="space-y-4 text-center text-slate-800 font-medium leading-loose font-serif text-lg">
                <p>العِلْمُ يَرْفَعُ بَيْتًا لا عِمَادَ لَهُ</p>
                <p>وَالجَهْلُ يَهْدِمُ بَيْتَ العِزِّ وَالشَّرَفِ</p>
                <div className="h-2"></div>
                <p>فاسعَ إلى العِلْمِ إِنْ كُنتَ تَطْلُبُهُ</p>
                <p>فَالنَّاسُ مَوْتَى وَأَهْلُ العِلْمِ أَحْيَاءُ</p>
              </div>

              <div className="flex justify-center mt-6 opacity-40">
                <svg width="40" height="10" viewBox="0 0 40 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 5H40" stroke="#94A3B8" strokeWidth="1" />
                  <circle cx="20" cy="5" r="3" fill="#94A3B8" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Laptop Image */}
        <div className="relative w-full flex justify-center mt-[-40px] lg:mt-[-80px] translate-y-10 lg:translate-y-20 z-30 pointer-events-none">
          <div className="w-full max-w-[900px]">
            <img
              src="/images/hero-desk.png"
              alt="Platform Dashboard on Devices"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
