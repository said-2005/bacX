"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1e1b4b]/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#020617]/40 blur-[150px] rounded-full" />
            </div>

            <GlassCard className="max-w-md w-full p-12 text-center border-white/5 relative z-10 flex flex-col items-center">

                {/* 3D Floating Graphic Concept */}
                <motion.div
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-8 relative"
                >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-xl absolute inset-0" />
                    <Compass className="w-32 h-32 text-primary relative z-10 drop-shadow-[0_0_30px_rgba(41,151,255,0.4)]" strokeWidth={1} />
                </motion.div>

                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-4 font-tajawal">
                    أنت خارج المسار
                </h1>

                <p className="text-zinc-400 mb-8 font-tajawal text-lg">
                    الصفحة التي تبحث عنها غير موجودة. يبدو أنك ضللت الطريق في رحلتك الدراسية.
                </p>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.back()}
                    className="w-full gap-2"
                >
                    <ArrowRight className="w-4 h-4" />
                    العودة للمسار الصحيح
                </Button>

            </GlassCard>
        </main>
    );
}
