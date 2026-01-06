
"use client";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 max-w-5xl mx-auto"
        >
            <h1 className="text-4xl font-bold mb-6">
                Experience
            </h1>
            <p className="mb-4">
                This is a placeholder for your Experience page. Add your work history, skills, and achievements here.
            </p>
        </motion.div>
    );
}