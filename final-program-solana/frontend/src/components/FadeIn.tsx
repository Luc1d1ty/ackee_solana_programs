"use client";

import { useEffect, useRef } from "react";

export default function FadeIn({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const delayClass =
        delay === 1
            ? "stagger-delay-1"
            : delay === 2
                ? "stagger-delay-2"
                : delay === 3
                    ? "stagger-delay-3"
                    : delay === 4
                        ? "stagger-delay-4"
                        : "";

    return (
        <div ref={ref} className={`fade-in-section ${delayClass} ${className}`}>
            {children}
        </div>
    );
}
