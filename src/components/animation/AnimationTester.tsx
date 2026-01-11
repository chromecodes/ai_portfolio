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
            <motion.div
                className="absolute inset-0 bg-black"
                initial={{
                    x: "0%",
                    skewX: 0,
                    filter: "blur(0px)",
                }}
                animate={{
                    x: [`0%`, `${direction * -120}%`, "0%"],
                    skewX: [0, direction * 8, 0],
                    filter: ["blur(0px)", "blur(10px)", "blur(0px)"],
                }}
                transition={{
                    duration: 0.35,
                    times: [0, 0.5, 1],
                    ease: "easeOut",
                }}
            />
        </div>
    );
}
