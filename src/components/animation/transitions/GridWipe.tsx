"use client";

import { motion } from "framer-motion";

const COLS = 14;
const ROWS = 8;

export default function GridWipe() {
    const tiles = Array.from({ length: COLS * ROWS });

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div
                className="grid w-full h-full bg-black"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                }}
            >
                {tiles.map((_, i) => {
                    const x = i % COLS;
                    const y = Math.floor(i / COLS);
                    const delay = (x + y) * 0.03;

                    return (
                        <motion.div
                            key={i}
                            className="bg-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                delay,
                                duration: 0.3,
                                ease: "easeOut",
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
