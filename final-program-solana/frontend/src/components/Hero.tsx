"use client";

import { Icon } from "@iconify/react";
import FadeIn from "./FadeIn";

export default function Hero() {
    return (
        <section className="min-h-screen flex flex-col md:px-16 overflow-hidden pt-32 pr-6 pb-20 pl-6 relative justify-center">
            {/* Decorative background elements */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 z-20">
                    <FadeIn delay={0}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-sky-800/50 backdrop-blur-sm mb-8">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                            <span className="text-xs font-mono text-cyan-400 tracking-wider">ROTOR PROTOCOL LIVE</span>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <h1 className="text-6xl md:text-8xl font-semibold tracking-tight leading-[0.9] mb-6 text-white">
                            Rotor<br />
                            <span className="text-gradient">Opens Time Owned Relics </span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 font-light leading-relaxed">
                            Lock messages and tokens in immutable time vaults. Securely encrypted on-chain until the moment you choose.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' })}
                                className="slice group"
                            >
                                <span className="text relative z-10 flex items-center gap-2">
                                    CREATE CAPSULE
                                    <Icon icon="solar:arrow-right-up-linear" width="18" />
                                </span>
                                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>

                            <button
                                onClick={() => document.getElementById('capsules')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group rounded-lg border border-sky-800 bg-slate-900/50 text-slate-300 font-mono px-8 py-4 transition-all hover:bg-slate-800 hover:border-cyan-500/50 flex items-center gap-2"
                            >
                                EXPLORE GALLERY
                                <Icon icon="solar:compass-linear" className="group-hover:rotate-45 transition-transform duration-300" width="18" />
                            </button>
                        </div>
                    </FadeIn>

                    {/* Trusted By */}
                    <FadeIn delay={0.4}>
                        <div className="mt-20 pt-8 border-t border-slate-800/50">
                            <p className="text-xs font-mono text-slate-500 mb-6 tracking-widest uppercase">Build and Secured using</p>
                            <div className="flex gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                {/* Simulated SVG Logos with Letters */}
                                <svg height="24" viewBox="0 0 100 24" className="fill-current text-slate-400">
                                    <text x="0" y="20" fontFamily="Space Mono" fontWeight="bold" letterSpacing="-1">RUST</text>
                                </svg>
                                <svg height="24" viewBox="0 0 100 24" className="fill-current text-slate-400">
                                    <text x="0" y="20" fontFamily="Space Mono" fontWeight="bold" letterSpacing="-1">SOLANA</text>
                                </svg>
                                <svg height="24" viewBox="0 0 120 24" className="fill-current text-slate-400">
                                    <text x="0" y="20" fontFamily="Space Mono" fontWeight="bold" letterSpacing="-1">ANCHOR</text>
                                </svg>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* 3D Hero Illustration (CSS/SVG) */}
                <div className="lg:col-span-5 relative h-[500px] flex items-center justify-center">
                    <FadeIn delay={0.2} className="w-full h-full">
                        <div className="relative w-full h-full animate-float">
                            {/* Abstract Hourglass/Time Construct */}
                            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                                <defs>
                                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                                    </linearGradient>
                                </defs>

                                {/* Orbital Rings */}
                                <circle cx="200" cy="200" r="160" fill="none" stroke="#075985" strokeWidth="1" strokeDasharray="4 8" className="animate-spin-slow" style={{ transformOrigin: 'center', opacity: 0.3 }}></circle>
                                <circle cx="200" cy="200" r="120" fill="none" stroke="#06b6d4" strokeWidth="1" className="animate-spin-slow" style={{ transformOrigin: 'center', animationDirection: 'reverse', animationDuration: '20s', opacity: 0.2 }}></circle>

                                {/* Central Geometric Time Shape */}
                                <g transform="translate(200, 200)">
                                    {/* Upper Pyramid */}
                                    <path d="M-60 -80 L60 -80 L0 0 Z" fill="url(#glassGrad)" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.6"></path>
                                    {/* Lower Pyramid */}
                                    <path d="M-60 80 L60 80 L0 0 Z" fill="url(#glassGrad)" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.6"></path>

                                    {/* Sand Particles */}
                                    <circle cx="0" cy="-40" r="2" fill="#fbbf24" className="animate-pulse"></circle>
                                    <circle cx="5" cy="-30" r="1.5" fill="#fbbf24" style={{ animationDelay: '0.2s' }} className="animate-pulse"></circle>
                                    <circle cx="-5" cy="-50" r="1.5" fill="#fbbf24" style={{ animationDelay: '0.5s' }} className="animate-pulse"></circle>

                                    {/* Falling Sand Line */}
                                    <line x1="0" y1="0" x2="0" y2="80" stroke="#fbbf24" strokeWidth="2" className="sand-stream" strokeOpacity="0.8" strokeDasharray="4 4"></line>

                                    {/* Pile at bottom */}
                                    <path d="M-20 75 Q0 60 20 75 Z" fill="#fbbf24" opacity="0.8"></path>
                                </g>
                            </svg>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
