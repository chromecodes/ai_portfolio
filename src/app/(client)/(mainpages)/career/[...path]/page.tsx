"use client";


import data from "@/data/career/prostack360/en.json";
import type { CareerDetail } from "@/types/career";
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
    const [career, setCareer] = useState(data as CareerDetail);

    const fetchData = async () => {
        const fileUrl = `/api/mainpages/career/${params.path[0]}/${lang}`;
        try {
            const response = await fetch(fileUrl);
            const data = await response.json();
            setCareer(data.data as CareerDetail);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        const fetchDataAndSetState = async () => {
            await fetchData();
            setIsLoading(false);
        }
        fetchDataAndSetState();
    }, [lang]);

    if (isloading) {
        return <RingLoader />
    } else {
        switch (params.path[0]) {
            case "origin":
                return <OrginPage data={career} />;
            case "future":
                return <CareerUI data={career} />;
            case "prostack360":
                return <CareerUI data={career} />;
            default:
                return <div>Career not found</div>;
        }
    }

}

