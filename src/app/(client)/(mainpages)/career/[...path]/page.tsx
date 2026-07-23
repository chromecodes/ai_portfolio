"use client";

import type careerTypes from "@/types/career";
import CareerUI from '@/features/Career/page/CareerUI';
import FutureUI from '@/features/Future/FutureUI';
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RingLoader from "@/features/Loaders/RingLoader";
import OrginPage from "@/features/Career/page/OrginPage";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import Link from "next/link";

export default function CareerPath() {
    const params = useParams() as { path: string[] };
    const lang = useLanguageStore((state) => state.language);
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    const [isloading, setIsLoading] = useState(true);
    const [career, setCareer] = useState<careerTypes | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const pathParam = params.path?.[0];
        if (!pathParam) return;

        if (pathParam === "future") {
            setIsLoading(false);
            return;
        }

        const fetchCareer = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/mainpages/career/${pathParam}/${lang}`);
                if (!response.ok) {
                    throw new Error(`Career path "${pathParam}" not found`);
                }
                const resData = await response.json();
                if (resData.success) {
                    setCareer(resData.data as careerTypes);
                } else {
                    setError(resData.message || "Failed to load career data");
                }
            } catch (err: any) {
                setError(err.message || "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCareer();
    }, [lang, params.path?.[0]]);

    if (isloading) {
        return <RingLoader />;
    }

    if (params.path?.[0] === "future") {
        return <FutureUI />;
    }

    if (error || !career) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-6">
                <span className="text-4xl">🔍</span>
                <h2 className="text-2xl font-bold text-font-color">
                    {strings.careerNotFound || "Career Details Not Found"}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                    {strings.careerNotFoundMessage || "We couldn't find the career path you were looking for."}
                </p>
                <Link
                    href="/career"
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full bg-accent-color text-primary-background shadow-xs hover:opacity-90 transition-opacity"
                >
                    {strings.backToCareerMap || "Back to Career Map"}
                </Link>
            </div>
        );
    }

    switch (params.path[0]) {
        case "origin":
            return <OrginPage data={career} />;
        case "prostack360":
        case "cognizant":
            return <CareerUI data={career} />;
        default:
            return <CareerUI data={career} />;
    }
}
