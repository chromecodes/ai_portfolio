"use client";

import { motion } from "framer-motion";

const STRIPS = 7;

export default function StripWipe() {
    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: STRIPS }).map((_, i) => (
                <motion.div
                    key={i}
                    className="flex-1 bg-white"
                    initial={{ y: "100%" }}
                    animate={{ y: "-100%" }}
                    transition={{
                        delay: i * 0.08,
                        duration: 0.6,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
