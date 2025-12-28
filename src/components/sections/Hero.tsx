"use client";

import { motion, type Variants } from "framer-motion";
import { SmartButton } from "@/components/ui/SmartButton";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ArrowLeft } from "lucide-react";

// Staggered Entrance Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const textRevealVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1], // Custom soft heavy ease
        },
    },
};

export function Hero() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">
            <CustomCursor />

            {/* 1. Background Architecture */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Glow Effects (Centered Spotlight) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/5 blur-[120px]" />

                {/* Deep Mesh Gradients */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1e1b4b]/20 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#020617]/40 blur-[100px]" />

                {/* Subtle Grid Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '3rem 3rem'
                    }}
                />

                {/* Radial Fade for Grid */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050505]/40 to-[#050505]" />
            </div>

            {/* 2. Main Content (Centered) */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center"
            >
                {/* H1 Headline */}
                <motion.h1
                    variants={textRevealVariants}
                    className="font-tajawal font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 tracking-tight"
                >
                    <span className="block text-white relative inline-block">
                        أعد تعريف
                        {/* Subtle Shimmer Overlay for Text */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
                    </span>
                    <br className="hidden sm:block" />
                    <span className="block text-zinc-500 mt-2 sm:mt-0">حدود طموحك</span>
                </motion.h1>

                {/* Subheader */}
                <motion.p
                    variants={textRevealVariants}
                    className="font-tajawal text-zinc-400 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-10"
                >
                    المعيار الذهبي للتحصيل العلمي. تجربة تقنية متقدمة مصممة لنخبة طلاب البكالوريا.
                </motion.p>

                {/* CTA Button */}
                <motion.div variants={textRevealVariants} className="relative z-50">
                    <SmartButton
                        href="/auth"
                        variant="secondary"
                        size="lg"
                        icon={ArrowLeft}
                        className="font-tajawal text-lg bg-black border border-white/10 text-white hover:bg-white/5 relative overflow-hidden group px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 active:scale-[0.98] cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            اكتشف التجربة
                        </span>
                        {/* Enhanced Button Shimmer - pointer-events-none is CRITICAL here */}
                        <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    </SmartButton>
                </motion.div>
            </motion.div>

            {/* 3. Bottom Fade / Bento Hint */}
            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-t from-[#050505] to-transparent z-10"
            />

        </section>
    );
}
