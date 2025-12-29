import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-[radial-gradient(1200px_700px_at_20%_20%,rgba(120,180,255,0.35),transparent_55%),radial-gradient(900px_600px_at_90%_85%,rgba(255,170,210,0.25),transparent_55%),linear-gradient(180deg,#f7fbff,white)] flex items-center justify-center p-6"
    >
      {/* Outer frame */}
      <div className="w-full max-w-6xl">
        {/* Big rounded hero card */}
        <div className="relative rounded-[42px] bg-white/55 border border-white/60 shadow-[0_40px_120px_rgba(15,23,42,0.18)] overflow-hidden">
          {/* subtle inner glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_400px_at_50%_0%,rgba(59,130,246,0.08),transparent_60%)]" />

          {/* content */}
          <div className="relative px-10 md:px-14 py-12 md:py-14">
            {/* Top brand */}
            <div className="flex items-start justify-end">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="text-2xl font-black tracking-tight">
                  bac<span className="text-blue-600">X</span>
                </span>
                <Image
                  src="/bacx-book.svg"
                  alt="book"
                  width={28}
                  height={28}
                  className="opacity-70"
                />
              </div>
            </div>

            {/* Main grid */}
            <div className="mt-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              {/* LEFT: Poem Card */}
              <div className="flex justify-start lg:justify-start">
                <div className="w-full max-w-md">
                  <div className="rounded-[28px] bg-white/70 border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-4">
                    <div className="relative overflow-hidden rounded-[22px]">
                      <Image
                        src="/poem-card.jpg"
                        alt="poem background"
                        width={900}
                        height={1200}
                        className="h-[420px] w-full object-cover"
                        priority
                      />
                      {/* Poem overlay */}
                      <div className="absolute inset-0 flex items-center justify-center px-10">
                        <div className="text-center text-slate-700 leading-[2.1] font-semibold drop-shadow-sm">
                          <p>وما الحياةُ سوى حُلمٍ أَلَمَّ بنا</p>
                          <p>قد مَرَّ كالحُلمِ ساعاتِ وأيامِ</p>
                          <p>هل عشتُ حقاً؟! يكادُ الشكُّ يَغلبُني</p>
                          <p>أم كان ما عشتُه أضغاثَ أحلامِ</p>
                          <p>في مِثلِ غَمضةِ عينٍ وانتباهتِها</p>
                          <p>قد أصبح الطفلُ شيخاً أبيضَ الهامِ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Headline + Buttons */}
              <div className="text-right">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                  حضِّر للبكالوريا بثقة
                </h1>
                <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-700">
                  وافتح باب مستقبلك
                </h2>

                <div className="mt-6 flex flex-wrap gap-4 justify-end">
                  {/* Primary */}
                  <Link
                    href="/auth?mode=login"
                    className="inline-flex items-center justify-center rounded-full bg-blue-700 px-8 py-3 text-white font-bold shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:bg-blue-800 transition"
                  >
                    تسجيل الدخول
                  </Link>

                  {/* Secondary */}
                  <Link
                    href="/auth?mode=signup"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/70 px-8 py-3 text-slate-700 font-bold hover:bg-white transition"
                  >
                    تسجيل حساب
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom: Desk scene */}
            <div className="mt-10 md:mt-12 flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="rounded-[28px] bg-white/55 border border-white/70 shadow-[0_22px_70px_rgba(15,23,42,0.16)] overflow-hidden">
                  <Image
                    src="/desk.jpg"
                    alt="desk scene"
                    width={1600}
                    height={900}
                    className="w-full h-[240px] md:h-[280px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: small outside soft shadows */}
        <div className="pointer-events-none mt-6 h-8 w-full bg-[radial-gradient(60%_100%_at_50%_0%,rgba(15,23,42,0.18),transparent_70%)] blur-2xl" />
      </div>
    </div>
  );
}
