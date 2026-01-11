"use client";

import { motion } from "framer-motion";
import EnergyCanvas from "./EnergyCanvas";

export default function EnergyOverlay() {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] bg-black pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
        >
            <EnergyCanvas />
        </motion.div>
    );
}
