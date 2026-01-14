"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrainyStoneLogoSVG({ className }: { className?: string }) {
    return (
        <div className={cn("relative", className)}>
            <Image
                src="/images/brainy-logo-v2.png"
                alt="Brainy"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
