
"use client";
import CareerMapCanvas from "@/components/UI/Career/CareerMapCanvas";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 max-w-5xl mx-auto"
        >
            <CareerMapCanvas />
        </motion.div>
    );
}