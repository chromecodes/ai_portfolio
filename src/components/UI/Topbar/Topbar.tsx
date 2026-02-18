"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import LogoViewer from "./LogoViewer";
import Navbar from "./Navbar";
import ToolBar from "./ToolBar";

export default function Topbar() {
    const pages = ["home", "career", "projects", "about"];

    const pathname = usePathname();
    const router = useRouter();

    // derive index safely from pathname
    const derivedIndex = useMemo(() => {
        const segment = pathname.split("/")[1] || "home";
        const index = pages.indexOf(segment);
        return index === -1 ? 0 : index;
    }, [pathname]);

    const [currentIndex, setCurrentIndex] = useState(derivedIndex);

    console.log(currentIndex);


    return (
        <header className="flex items-center justify-between border-b border-borderColor px-6 py-3 bg-background">
            <LogoViewer />

            <Navbar
                pages={pages}
                height={28}
                onNavigate={(page, index) => {
                    if (index === currentIndex) return;
                    setCurrentIndex(index);
                    router.push(`/${page}`);
                }}
                index={currentIndex}
            />

            <ToolBar />
        </header>
    );
}
