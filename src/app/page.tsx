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
        <div className="order-1 flex flex-col justify-center space-y-8 lg:space-y-10 py-10 relative z-20">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.2] tracking-tight">
              حضِّر للبكالوريا بثقة...
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-500">
                وافتـح باب مستقبلك.
              </span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-loose max-w-lg">
              خطة مراجعة واضحة، وإرشاد يساعدك على التركيز.
            </p>
          </div>

          {/* Buttons: Login (Primary), Register (Secondary) */}
          <div className="flex flex-wrap gap-5 items-center">
            {/* Primary: Login */}
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_4px_20px_-2px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              تسجيل الدخول
            </Link>

            {/* Secondary: Register */}
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-10 py-4 rounded-full font-bold text-lg hover:border-blue-300 hover:text-blue-600 transition-colors duration-300"
            >
              تسجيل حساب
            </Link>
          </div>

          {/* Desk Setup Image */}
          <div className="pt-2 w-full max-w-xl">
             <img 
               src="/images/hero-desk.png" 
               alt="Study Desk Setup" 
               className="w-full h-auto object-contain drop-shadow-2xl"
             />
          </div>
        </div>

        {/* Left Column: Floating Poem Card */}
        <div className="order-2 relative flex items-center justify-center lg:justify-end py-10">
          
          {/* Card Container with Sky Texture Background */}
          <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] text-center max-w-lg w-full overflow-hidden">
             
             {/* Subtle internal texture/gradient mimicking sky */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/20 to-indigo-50/30 -z-10" />

             {/* Poem Text */}
             <div className="space-y-6 text-slate-800 font-medium leading-[2.2] font-serif">
                <div className="text-xl md:text-2xl space-y-2">
                   <p>وما الحياةُ سوى حُلمٍ أَلَمَّ بنا</p>
                   <p>قد مَرَّ كالحُلمِ ساعاتِ وأيامِ</p>
                   <div className="h-4" /> {/* Spacer */}
                   <p>هل عشتُ حقاً؟! يكادُ الشكُّ يَغلبُني</p>
                   <p>أم كان ما عشتُه أضغاثَ أحلامِ</p>
                   <div className="h-4" /> {/* Spacer */}
                   <p>في مِثلِ غَمضةِ عينٍ وانتباهتِها</p>
                   <p>قد أصبح الطفلُ شيخاً أبيضَ الهامِ</p>
                </div>
             </div>

             {/* Footer Line */}
             <div className="mt-10 pt-8 border-t border-slate-200/60">
                <p className="text-slate-600 text-base leading-relaxed italic">
                  "كنتُ تلميذًا مثلَكم… واليوم أكتب لكم الطريق: ثباتٌ صغير اليوم، يصنعُ فرقًا كبيرًا غدًا."
                </p>
             </div>
          </div>

        </div>

      </main>
    </div>
  );
}
