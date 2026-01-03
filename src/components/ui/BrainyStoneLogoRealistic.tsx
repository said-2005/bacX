"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function BrainyStoneLogoRealistic({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full drop-shadow-2xl", className)}
            aria-label="Brainy Logo"
        >
            <defs>
                {/* 1. Base Dark Stone Gradient */}
                <linearGradient id="obsidianGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2a2a35" />
                    <stop offset="50%" stopColor="#111115" />
                    <stop offset="100%" stopColor="#050505" />
                </linearGradient>

                {/* 2. Stone Texture Filter (Noise + Lighting) */}
                <filter id="stone3D" x="-20%" y="-20%" width="140%" height="140%">
                    {/* Create surface roughness */}
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" result="noise" />

                    {/* Lighting Map based on noise */}
                    <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="1.5" result="diffuse">
                        <feDistantLight azimuth="45" elevation="60" />
                    </feDiffuseLighting>

                    {/* Specular Highlights for the "Wet/Polished" look */}
                    <feSpecularLighting in="noise" surfaceScale="2" specularConstant="0.8" specularExponent="20" lightingColor="#aaccff" result="specular">
                        <fePointLight x="-500" y="-1000" z="800" />
                    </feSpecularLighting>

                    {/* Combine Lighting with Object Source */}
                    <feComposite operator="in" in="diffuse" in2="SourceGraphic" result="textured_diffuse" />
                    <feComposite operator="in" in="specular" in2="SourceGraphic" result="textured_specular" />

                    {/* Blend everything: Base Color + Diffuse Shadow + Specular Highlight */}
                    <feBlend mode="multiply" in="textured_diffuse" in2="SourceGraphic" result="base_shaded" />
                    <feBlend mode="screen" in="textured_specular" in2="base_shaded" />
                </filter>

                {/* 3. Deep Bevel Filter for Main Segments */}
                <filter id="bevelInset">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
                    <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#bbbbbb" result="specOut">
                        <fePointLight x="-5000" y="-10000" z="20000" />
                    </feSpecularLighting>
                    <feComposite operator="in" in="specOut" in2="SourceAlpha" result="specOut" />
                    <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="SourceGraphic" in2="specOut" result="litPaint" />
                    <feMerge>
                        <feMergeNode in="offsetBlur" />
                        <feMergeNode in="litPaint" />
                    </feMerge>
                </filter>

                {/* 4. Glow Filter for the Eye */}
                <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* --- LAYOUT GROUP --- */}
            <g filter="url(#stone3D)">

                {/* --- PYRAMID FRAME --- */}
                {/* Main Outline */}
                <path d="M200 20 L380 300 H20 L200 20 Z" fill="url(#obsidianGradient)" stroke="#000" strokeWidth="2" />

                {/* --- LATTICE WORK (Geometric Weave) --- */}
                {/* Top Triangle Section */}
                <path d="M200 50 L250 130 H150 L200 50 Z" fill="url(#obsidianGradient)" stroke="#111" strokeWidth="4" />

                {/* Middle Band - The "Eye" Chamber */}
                {/* Left Support */}
                <path d="M140 140 L80 230 H130 L170 170 Z" fill="url(#obsidianGradient)" />
                {/* Right Support */}
                <path d="M260 140 L320 230 H270 L230 170 Z" fill="url(#obsidianGradient)" />

                {/* Bottom Base Bricks */}
                <path d="M50 250 H350 L370 290 H30 L50 250 Z" fill="url(#obsidianGradient)" />
                <rect x="195" y="250" width="10" height="40" fill="#000" opacity="0.5" />
                <rect x="100" y="250" width="10" height="40" fill="#000" opacity="0.5" />
                <rect x="290" y="250" width="10" height="40" fill="#000" opacity="0.5" />
            </g>

            {/* --- CENTERPIECES (Above Texture) --- */}

            {/* GRADUATION CAP */}
            <g transform="translate(200, 100)" filter="url(#stone3D)">
                {/* Cap Board */}
                <path d="M0 -30 L60 0 L0 30 L-60 0 Z" fill="#222" />
                {/* Skullcap */}
                <path d="M-40 10 V25 C-40 40 40 40 40 25 V10" fill="#222" />
                {/* Tassel */}
                <circle cx="0" cy="0" r="4" fill="#111" />
                <path d="M0 0 L40 5 V30" stroke="#111" strokeWidth="3" fill="none" />
            </g>

            {/* THE EYE (Center) */}
            <g transform="translate(200, 190)">
                {/* Eye Shape - Stone Container */}
                <path
                    d="M-70 0 Q0 -40 70 0 Q0 40 -70 0 Z"
                    fill="#151515"
                    stroke="#333"
                    strokeWidth="2"
                    filter="url(#stone3D)"
                />

                {/* Pupil - Glowing */}
                <circle cx="0" cy="0" r="18" fill="#FFF" filter="url(#eyeGlow)" opacity="0.9" />
                <circle cx="0" cy="0" r="8" fill="#e0faff" />
            </g>

            {/* --- TEXT "Brainy" --- */}
            <g transform="translate(200, 360)" filter="url(#stone3D)">
                <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fontFamily="serif"
                    fontSize="72"
                    fontWeight="900"
                    fill="url(#obsidianGradient)"
                    style={{ letterSpacing: '0.05em', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                >
                    Brainy
                </text>
            </g>

        </svg>
    );
}
