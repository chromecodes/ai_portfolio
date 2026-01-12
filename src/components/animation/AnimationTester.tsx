"use client";

import { motion } from "framer-motion";

const COLS = 14;
const ROWS = 8;
const STRIPS = 14;
const tiles = Array.from({ length: COLS * ROWS });
const direction = Math.random() < 0.5 ? 1 : -1;

export default function AnimationTester() {
    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">

            {/* Glow */}
            <motion.div
                className="absolute"
                style={{
                    width: "200%",
                    height: "20%",
                    left: "-60%",
                    bottom: "-60%",
                    background: "rgba(217, 216, 216, 1)",
                    transform: "rotate(40deg)",
                }}
                animate={{
                    left: "140%",
                    bottom: "140%",
                }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut",
                }}
            />

            {/* Core slash */}
            <motion.div
                className="absolute bg-white"
                style={{
                    width: "200%",
                    height: "20%",
                    left: "-60%",
                    bottom: "-60%",
                    boxShadow: "0 0 32px rgba(255,255,255,0.9)",
                    transform: "rotate(40deg)",
                }}
                animate={{
                    left: "120%",
                    bottom: "120%",
                }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut",
                }}
            />
        </div>
    );
}
