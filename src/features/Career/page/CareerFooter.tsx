"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import useLanguageStore from '@/utils/i18n/useLanguageStore';
import { CAREER_DATA } from '@/features/Career/Graph/data/careerData';

export default function CareerFooter() {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    const params = useParams() as { path?: string[] };
    const router = useRouter();

    const currentSlug = params.path?.[0];
    const careerOrder = CAREER_DATA.map((node) => node.id);
    const currentIndex = currentSlug ? careerOrder.indexOf(currentSlug) : -1;

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < careerOrder.length - 1;

    const handlePrev = () => {
        if (hasPrev) {
            router.push(`/career/${careerOrder[currentIndex - 1]}`);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            router.push(`/career/${careerOrder[currentIndex + 1]}`);
        }
    };

    const handleBackToMap = () => {
        router.push('/career');
    };

    return (
        <footer className="flex justify-between items-center text-sm text-muted-foreground pt-10 mt-16 border-t">
            <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`hover:text-accent-color hover:cursor-pointer transition-all flex items-center gap-1 ${
                    hasPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                ← {strings.previousCompany}
            </button>

            <button
                onClick={handleBackToMap}
                className="hover:text-accent-color hover:cursor-pointer transition-all flex items-center gap-1"
            >
                {strings.backToCareerMap}
            </button>

            <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`hover:text-accent-color hover:cursor-pointer transition-all flex items-center gap-1 ${
                    hasNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                {strings.nextCompany} →
            </button>
        </footer>
    );
}