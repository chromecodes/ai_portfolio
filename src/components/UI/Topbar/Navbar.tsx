import { useState } from "react";

import * as React from 'react';

export interface INavbarProps {
    pages: string[];
    height: number;
    onNavigate: (page: string, index: number) => void;
}

export default function Navbar(props: INavbarProps) {
    const { pages, height, onNavigate } = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleNavigation = (targetIndex: number) => {
        if (isAnimating || targetIndex === currentIndex) return;

        setIsAnimating(true);
        setCurrentIndex(targetIndex);

        if (onNavigate) {
            onNavigate(pages[targetIndex], targetIndex);
        }

        setTimeout(() => setIsAnimating(false), 500);
    };

    const getCircularIndex = (index: number) => {
        return ((index % pages.length) + pages.length) % pages.length;
    };

    const prevIndex = getCircularIndex(currentIndex - 1);
    const nextIndex = getCircularIndex(currentIndex + 1);

    // Calculate font sizes based on height
    const centerFontSize = Math.floor(height * 1);
    const sideFontSize = Math.floor(height * 0.8);
    // const dotSize = Math.floor(height * 0.15);

    return (
        <div className="w-96 flex flex-col items-center gap-3">
            {/* Navbar */}
            <div
                className="relative w-full max-w-2xl flex items-center justify-center overflow-hidden"
                style={{ height: `${height}px` }}
            >
                {/* Left Item (Previous) */}
                <div
                    className="absolute left-0 transition-all duration-500 ease-out cursor-pointer"
                    style={{
                        transform: isAnimating
                            ? "translateX(-50px) scale(0.85)"
                            : "translateX(0) scale(0.85)",
                        opacity: isAnimating ? 0 : 0.4,
                        fontSize: `${sideFontSize}px`,
                    }}
                    onClick={() => handleNavigation(prevIndex)}
                >
                    <div
                        className="font-bold text-gray-300 select-none"
                        style={{
                            background: "linear-gradient(to right, transparent 0%, currentColor 60%, currentColor 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {pages[prevIndex]}
                    </div>
                </div>

                {/* Center Item (Current) */}
                <div
                    className="absolute transition-all duration-500 ease-out"
                    style={{
                        transform: "scale(1)",
                        opacity: 1,
                        fontSize: `${centerFontSize}px`,
                    }}
                >
                    <div className=" font-bold text-gray-300 select-none">
                        {pages[currentIndex]}
                    </div>
                </div>

                {/* Right Item (Next) */}
                <div
                    className="absolute right-0 transition-all duration-500 ease-out cursor-pointer"
                    style={{
                        transform: isAnimating
                            ? "translateX(50px) scale(0.85)"
                            : "translateX(0) scale(0.85)",
                        opacity: isAnimating ? 0 : 0.4,
                        fontSize: `${sideFontSize}px`,
                    }}
                    onClick={() => handleNavigation(nextIndex)}
                >
                    <div
                        className="font-bold text-gray-300 select-none"
                        style={{
                            background: "linear-gradient(to left, transparent 0%, currentColor 60%, currentColor 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {pages[nextIndex]}
                    </div>
                </div>
            </div>

            {/* Page Indicator Dots */}
            {/* <div className="flex gap-2">
                {pages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleNavigation(index)}
                        disabled={isAnimating}
                        className={`transition-all duration-300 rounded-full ${index === currentIndex
                            ? "bg-gray-900"
                            : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        style={{
                            width: index === currentIndex ? `${dotSize * 3}px` : `${dotSize}px`,
                            height: `${dotSize}px`,
                        }}
                    />
                ))}
            </div> */}
        </div>
    );
}
