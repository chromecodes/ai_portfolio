"use client";

import { useState } from "react";
import LogoViewer from "./LogoViewer";
import Navbar from "./Navbar";
import ToolBar from "./ToolBar";
import { useRouter } from "next/navigation";

export default function Topbar() {
    const pages = ["home", "experience", "projects", "about"];
    const [currentIndex, setCurrentIndex] = useState(0);

    const router = useRouter();

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-transparent backdrop-blur-md">
            <LogoViewer />
            <Navbar
                pages={pages}
                height={28}
                onNavigate={(page, index) => {
                    if (index === currentIndex) return;
                    setCurrentIndex(index);
                    router.push(`/${pages[index]}`);
                }}
            />
            <ToolBar />
        </header>
    );
}
