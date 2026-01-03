"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BrainyLogoProps {
    variant?: "full" | "icon";
    className?: string;
}

export function BrainyLogo({ variant = "full", className }: BrainyLogoProps) {
    return (
        <div className={cn("relative select-none", className)}>
            {variant === "full" ? (
                <div className="relative w-48 h-auto aspect-[1/1]"> {/* Adjust aspect ratio if known, assuming 1:1 for now */}
                    <Image
                        src="/images/luxurious-stone-logo.png"
                        alt="Brainy Logo"
                        width={512}
                        height={512}
                        className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        priority
                    />
                </div>
            ) : (
                <div className="relative w-full h-full overflow-hidden rounded-xl"> {/* Icon Variant */}
                    <Image
                        src="/images/luxurious-stone-logo.png"
                        alt="Brainy Icon"
                        width={512}
                        height={512}
                        className="absolute top-0 left-0 w-full h-full object-cover scale-[1.3] origin-top"
                    // scale and origin tuned to zoom into the pyramid, hiding text.
                    // This might need fine-tuning based on the actual image composition.
                    />
                </div>
            )}
        </div>
    );
}
