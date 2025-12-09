import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface INavbarProps {
    pages: string[];
    height: number;
    onNavigate: (page: string, index: number) => void;
}

export default function Navbar({ pages, height, onNavigate }: INavbarProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

    const getCircularIndex = (index: number) =>
        ((index % pages.length) + pages.length) % pages.length;

    const handleNavigation = (targetIndex: number) => {
        if (targetIndex === currentIndex) return;
        setDirection(targetIndex > currentIndex ? 1 : -1);
        setCurrentIndex(getCircularIndex(targetIndex));
        onNavigate?.(pages[getCircularIndex(targetIndex)], getCircularIndex(targetIndex));
    };

    // Font sizes
    const centerFontSize = Math.floor(height * 0.8);
    const sideFontSize = Math.floor(height * 0.6);
    const dotSize = Math.floor(height * 0.15);

    // Animation variants
    const sideVariant = {
        enter: (dir: number) => ({
            x: dir * 50,
            scale: 0.85,
            opacity: 0,
        }),
        center: {
            x: 0,
            scale: 1,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: -dir * 50,
            scale: 0.85,
            opacity: 0,
        }),
    };

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-lg">
            {/* Navbar */}
            <div
                className="relative flex items-center justify-center w-full overflow-hidden"
                style={{ height }}
            >
                {/* Previous */}
                <motion.button
                    key={getCircularIndex(currentIndex - 1)}
                    custom={-1}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={sideVariant}
                    transition={{ duration: 0.5 }}
                    onClick={() => handleNavigation(getCircularIndex(currentIndex - 1))}
                    className="absolute left-0 font-bold text-gray-300 select-none cursor-pointer"
                    style={{
                        fontSize: sideFontSize,
                        background: "linear-gradient(to right, transparent 0%, currentColor 60%, currentColor 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    {pages[getCircularIndex(currentIndex - 1)]}
                </motion.button>

                {/* Current */}
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        initial={{ x: direction * 50, scale: 0.85, opacity: 0 }}
                        animate={{ x: 0, scale: 1, opacity: 1 }}
                        exit={{ x: -direction * 50, scale: 0.85, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute font-bold text-gray-300 select-none"
                        style={{ fontSize: centerFontSize }}
                    >
                        {pages[currentIndex]}
                    </motion.div>
                </AnimatePresence>

                {/* Next */}
                <motion.button
                    key={getCircularIndex(currentIndex + 1)}
                    custom={1}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={sideVariant}
                    transition={{ duration: 0.5 }}
                    onClick={() => handleNavigation(getCircularIndex(currentIndex + 1))}
                    className="absolute right-0 font-bold text-gray-300 select-none cursor-pointer"
                    style={{
                        fontSize: sideFontSize,
                        background: "linear-gradient(to left, transparent 0%, currentColor 60%, currentColor 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    {pages[getCircularIndex(currentIndex + 1)]}
                </motion.button>
            </div>

            {/* Page Dots */}
            {/* <div className="flex gap-2 mt-2">
                {pages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleNavigation(index)}
                        aria-current={index === currentIndex ? "page" : undefined}
                        className={`transition-all duration-300 rounded-full ${index === currentIndex ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        style={{
                            width: index === currentIndex ? dotSize * 3 : dotSize,
                            height: dotSize,
                        }}
                    />
                ))}
            </div> */}
        </div>
    );
}
