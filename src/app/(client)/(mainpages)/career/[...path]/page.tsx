"use client";


import type careerTypes from "@/types/career";
import CareerUI from '@/features/Career/page/CareerUI';
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RingLoader from "@/features/Loaders/RingLoader";
import OrginPage from "@/features/Career/page/OrginPage";
import useLanguageStore from "@/utils/i18n/useLanguageStore";

export default function CareerPath() {

    const params = useParams() as { path: string[] };


    const lang = useLanguageStore((state) => state.language);

    const [isloading, setIsLoading] = useState(true);
    const [career, setCareer] = useState<careerTypes | null>(null);


    const fetchData = async () => {
        if (!params.path || params.path.length === 0) return;
        const fileUrl = `/api/mainpages/career/${params.path[0]}/${lang}`;
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const resData = await response.json();
            if (resData.success) {
                setCareer(resData.data as careerTypes);
            } else {
                console.error("API error fetching data:", resData.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        const pathParam = params.path?.[0];
        if (!pathParam) return;

        const fetchDataAndSetState = async () => {
            setIsLoading(true);
            await fetchData();
            setIsLoading(false);
        }
        fetchDataAndSetState();
    }, [lang, params.path?.[0]]);

    if (isloading || !career) {
        return <RingLoader />
    } else {
        switch (params.path[0]) {
            case "origin":
                return <OrginPage data={career} />;
            case "future":
                return <CareerUI data={career} />;
            case "prostack360":
                return <CareerUI data={career} />;
            case "cognizant":
                return <CareerUI data={career} />;
            default:
                return <div>Career not found</div>;
        }
    }

}


