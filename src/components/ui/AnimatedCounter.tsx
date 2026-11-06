import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    formatNumber?: boolean;
}

export function AnimatedCounter({
    value,
    duration = 1800,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = '',
    formatNumber = false,
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const elementRef = useRef<HTMLSpanElement | null>(null);
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !hasAnimatedRef.current) {
                    hasAnimatedRef.current = true;
                    const startTime = performance.now();

                    const step = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Smooth ease-out cubic curve
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const current = easeOut * value;
                        setDisplayValue(current);

                        if (progress < 1) {
                            requestAnimationFrame(step);
                        } else {
                            setDisplayValue(value);
                        }
                    };

                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [value, duration]);

    const formatted = decimals > 0 
        ? displayValue.toFixed(decimals) 
        : Math.round(displayValue).toString();

    const finalString = formatNumber
        ? Number(formatted).toLocaleString('en-IN')
        : formatted;

    return (
        <span ref={elementRef} className={`inline-block tabular-nums ${className}`}>
            {prefix}{finalString}{suffix}
        </span>
    );
}

export default AnimatedCounter;

