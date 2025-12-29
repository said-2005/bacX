"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Brain, BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white relative overflow-hidden font-vazirmatn text-slate-900 selection:bg-blue-100 selection:text-blue-900">

      {/* Background Abstract Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50/50 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 h-screen flex flex-col md:flex-row relative z-10">

        {/* LEFT SIDE: Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center pt-8 md:pt-0">

          {/* Header / Logo */}
          <div className="absolute top-8 left-6 md:left-0 flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              bac<span className="text-blue-600">X</span>
            </h1>
          </div>

          <div className="space-y-8 max-w-lg mt-20 md:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Headlines */}
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1]">
                Master Your BAC. <br />
                <span className="text-slate-800">Secure Your Future.</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                Comprehensive preparation for the BAC exam.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button className="h-12 px-8 rounded-full text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all hover:scale-105 active:scale-95">
                  Login
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button className="h-12 px-8 rounded-full text-lg font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm transition-all hover:scale-105 active:scale-95">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Feature Cards (Glassmorphism) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {/* Card 1 */}
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-white/80 transition-colors">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 leading-tight">Personalized <br /> Study Plans</span>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-white/80 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 leading-tight">Expert <br /> Teachers</span>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-white/80 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 leading-tight">Mock Exams <br /> & Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Hero Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center relative md:translate-x-10">
          <div className="relative w-full aspect-square max-w-[800px] animate-in fade-in zoom-in duration-1000 delay-200">
            <Image
              src="/images/hero-desk.png"
              alt="BacX Study Setup"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

      </div>
    </main>
  );
}
