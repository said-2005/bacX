import React from "react";
import Link from "next/link";

export default function Page() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-100 px-6 md:px-20 font-sans text-slate-900"
    >
      <header className="pt-10 flex justify-between items-center">
        <h1 className="text-3xl font-black">
          bac<span className="text-blue-600">X</span>
        </h1>

        <div className="flex gap-3">
          <Link
            href="/auth?mode=login"
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
          >
            إنشاء حساب
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full min-h-[calc(100vh-96px)] grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 md:py-14">
        {/* النص الرئيسي */}
        <div className="space-y-6 lg:space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
              حضِّر للبكالوريا…<br />
              <span className="text-slate-800">وافـتح باب مستقبلك.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl">
              منصة BacX تمنحك دروسًا منظمة، متابعة تقدّم، وتمارين موجّهة—باش توصل للنتيجة اللي تستاهلها.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-3 rounded-full font-extrabold shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
            >
              ابدأ الآن
            </Link>

            <Link
              href="/lessons"
              className="inline-flex items-center justify-center bg-white/80 text-slate-900 px-10 py-3 rounded-full font-bold shadow-lg shadow-slate-200 hover:bg-white transition-colors"
            >
              تصفّح الدروس
            </Link>
          </div>
        </div>

        {/* بدل الصورة: قصيدة + عبارة */}
        <div className="relative">
          <div
            className="
              rounded-[2rem] border border-white/40 shadow-2xl
              bg-white/70 hover:bg-white/80
              md:bg-white/45 md:hover:bg-white/55
              supports-[backdrop-filter]:bg-white/45
              supports-[backdrop-filter]:backdrop-blur-xl
              p-7 md:p-10
            "
          >
            <div className="space-y-6">
              <div className="text-slate-900 leading-[2.2] text-[15px] sm:text-[16px] md:text-[17px] font-semibold">
                <p>ومَا الحيَاةُ سِوى حُلمٍ ألمَّ بنَا</p>
                <p className="pr-8">قد مَرَّ كالحُلمِ سَاعَاتِي وأيَّامِي</p>

                <p>هلْ عِشتُ حقًّا!؟، يَكادُ الشَّكُّ يَغلِبُنِي</p>
                <p className="pr-8">أمْ كانَ مَا عِشتُه أضغاثَ أحلامِ!؟</p>

                <p>فِي مِثلِ غَمضَةِ عَينٍ وانتبَاهتِها</p>
                <p className="pr-8">قدْ أصبحَ الطِّفلُ شيخًا أبيضَ الهَامِ</p>
              </div>

              <div className="h-px bg-slate-200/70" />

              <p className="text-slate-700 text-base sm:text-lg font-bold leading-relaxed">
                لا زِلتُ أتذكّر… كأنَّ البارحةَ كانَت؛ كنتُ تلميذًا في مكانِكم،
                بنفسِ الخوفِ والأمل… واليومَ جئتُ لأقول لكم: لا تُضيّعوا وقتكم،
                فخطوةٌ واحدةٌ صادقةٌ قد تصنعُ لكم عمرًا كاملًا.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
