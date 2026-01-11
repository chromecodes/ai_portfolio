"use client";

import { useState } from "react";
import Agentbar from "./Agentbar";
import Leftwing from "./Leftwing";
import Rightwing from "./Rightwing";

export default function Footbar() {
    const [currentIndex, setCurrentIndex] = useState(0);


    return (
        <footer className="flex items-end justify-between border-t border-borderColor px-6 py-3 bg-background">
            <Leftwing />
            <Agentbar />
            <Rightwing />
        </footer>
    );
}
