
"use client";
import CareerMapCanvas from "@/components/UI/Career/Graph/CareerMapCanvas";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full flex flex-1 grow items-center justify-center min-h-0"
        >
            {/* <div className="mx-auto h-[520px] max-w-6xl rounded-xl border border-white/10 overflow-hidden"> */}
            <CareerMapCanvas careerCount={6} particleCount={150} />
            {/* </div> */}
        </motion.div>
    );
}