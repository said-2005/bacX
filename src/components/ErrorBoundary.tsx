"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                    <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2 font-tajawal">حدث خطأ غير متوقع</h1>
                        <p className="text-zinc-400 mb-8 font-tajawal leading-relaxed">
                            نعتذر عن هذا الخلل. حاول تحديث الصفحة، إذا استمرت المشكلة يرجى التواصل مع الدعم الفني.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full bg-white text-black hover:bg-zinc-200"
                                icon={RefreshCw}
                            >
                                تحديث الصفحة
                            </Button>

                            <div className="text-xs text-zinc-600 mt-4 font-mono dir-ltr select-all">
                                {this.state.error?.message?.slice(0, 50)}...
                            </div>
                        </div>
                    </GlassCard>
                </div>
            );
        }

        return this.props.children;
    }
}
