"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 max-w-5xl mx-auto"
        >
            <h1 className="text-4xl font-bold mb-6">Welcome to My AI Portfolio</h1>
            <p className="mb-4">This is the Phase 1 static page setup with Tailwind + Shadcn + Framer Motion.</p>
            <Button>Get Started</Button>
        </motion.div>
    );
}
