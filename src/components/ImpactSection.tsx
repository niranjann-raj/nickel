import React from 'react';
import { StaggerTestimonials } from './ui/stagger-testimonials';

export default function ImpactSection() {
    return (
        <section id="about" className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
                <div className="observe-animate text-left">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mb-4 leading-[1.15] max-w-4xl">
                        Trusted by Thousands of Modern Savers
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-400 max-w-2xl font-normal">
                        See how Nickel transforms saving habits, eliminates split debt friction, and builds consistent wealth without anxiety.
                    </p>
                </div>
            </div>

            {/* Testimonials Carousel */}
            <div className="w-full">
                <StaggerTestimonials />
            </div>
        </section>
    );
}
