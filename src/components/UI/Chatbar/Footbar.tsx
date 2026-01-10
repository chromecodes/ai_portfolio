"use client";

import { useState } from "react";
import Agentbar from "./Agentbar";
import Leftwing from "./Leftwing";
import Rightwing from "./Rightwing";

export default function Footbar() {
    const [currentIndex, setCurrentIndex] = useState(0);


    return (
        <footer className="flex items-center justify-between border-t px-6 py-3 bg-background backdrop-blur-md">
            <Leftwing />
            <Agentbar />
            <Rightwing />
        </footer>
    );
}
