import React from "react";
import Link from "next/link";
import { Vazirmatn } from "next/font/google";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
});

export default function Page() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-white font-sans text-slate-900 ${vazirmatn.variable}`}
    >
      {/* Subtle Background Orbs (Depth) */}
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header - Logo Only */}
      <header className="relative z-10 pt-8 px-6 md:px-20 flex justify-between items-center">
        <h1 className="text-4xl font-black tracking-tighter">
          bac<span className="text-blue-600">X</span>
        </h1>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl w-full min-h-[calc(100vh-100px)] grid lg:grid-cols-2 gap-12 lg:gap-20 items-center px-6 py-12 md:px-20 md:py-20">

        {/* Right Column (Hero Content) */}
        <div className="order-1 flex flex-col justify-center space-y-10">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl/tight font-extrabold text-slate-900 tracking-tight">
              حضّر للبكالوريا...
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-600">
                وافتح باب مستقبلك.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-lg">
              منصة bacX تمنحك دروسًا منظمة، متابعة دقيقة، وتمارين شاملة لتصل إلى النتيجة التي تستحقها.
            </p>
          </div>

          {/* Buttons (Relocated & Styled) */}
          <div className="flex flex-wrap gap-5">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.35)] hover:-translate-y-1 transition-all duration-300"
            >
              إنشاء حساب
            </Link>
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center bg-white text-blue-600 border border-blue-100 px-10 py-4 rounded-full font-bold text-lg shadow-lg shadow-slate-200/50 hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Left Column (Poem Card) */}
        <div className="order-2 relative perspective-1000">
          {/* Glass Card */}
          <div
            className="
              relative overflow-hidden
              rounded-[2.5rem] 
              border border-white/60 
              bg-white/30 
              backdrop-blur-2xl
              shadow-[0_20px_50px_rgba(0,0,0,0.08)]
              p-8 md:p-12
              group
              transition-all duration-500
              hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]
              hover:bg-white/40
            "
          >
            {/* Inner Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="space-y-8 text-center relative z-10">
              {/* Poem */}
              <div className="space-y-4 text-slate-800 font-bold text-lg md:text-xl leading-[2.4] tracking-wide select-none cursor-default font-serif md:font-sans">
                <p className="opacity-90 transition-opacity hover:opacity-100">ومَا الحيَاةُ سِوى حُلمٍ ألمَّ بنَا</p>
                <p className="opacity-90 transition-opacity hover:opacity-100 pb-2">قد مَرَّ كالحُلمِ سَاعَاتِي وأيَّامِي</p>

                <div className="w-16 h-px bg-blue-200 mx-auto rounded-full my-2"></div>

                <p className="opacity-90 transition-opacity hover:opacity-100">فِي مِثلِ غَمضَةِ عَينٍ وانتبَاهتِها</p>
                <p className="opacity-90 transition-opacity hover:opacity-100">قدْ أصبحَ الطِّفلُ شيخًا أبيضَ الهَامِ</p>
              </div>

              {/* Message */}
              <div className="relative pt-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                <p className="text-slate-600 text-[15px] md:text-base font-medium leading-loose pt-6 italic">
                  "لا زِلتُ أتذكّر... كأنَّ البارحةَ كانَت؛ كنتُ تلميذًا في مكانِكم،
                  بنفسِ الخوفِ والأمل... واليومَ جئتُ لأقول لكم: لا تُضيّعوا وقتكم،
                  فخطوةٌ واحدةٌ صادقةٌ قد تصنعُ لكم عمرًا كاملًا."
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
