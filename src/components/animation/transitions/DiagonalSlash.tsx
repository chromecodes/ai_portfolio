"use client";

import { motion } from "framer-motion";

export default function DiagonalSlash() {
    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">

            {/* Glow */}
            <motion.div
                className="absolute"
                style={{
                    width: "200%",
                    height: "160px",
                    left: "-60%",
                    bottom: "-40%",
                    background: "rgba(255,255,255,0.25)",
                    filter: "blur(40px)",
                    transform: "rotate(40deg)",
                }}
                animate={{
                    left: "140%",
                    bottom: "140%",
                }}
                transition={{
                    duration: 1.1,
                    ease: "easeOut",
                }}
            />

            {/* Core slash */}
            <motion.div
                className="absolute bg-white"
                style={{
                    width: "160%",
                    height: "70px",
                    left: "-50%",
                    bottom: "-25%",
                    borderRadius: "999px",
                    boxShadow: "0 0 32px rgba(255,255,255,0.9)",
                    transform: "rotate(40deg)",
                }}
                animate={{
                    left: "120%",
                    bottom: "120%",
                }}
                transition={{
                    duration: 0.9,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
