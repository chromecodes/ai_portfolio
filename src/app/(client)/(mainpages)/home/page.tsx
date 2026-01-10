"use client";
import { Button } from "@/components/ui/button";
import PulseBackground from "@/components/UI/Home/PulseBackground";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        // <motion.div
        //     initial={{ opacity: 0, y: 20 }}
        //     animate={{ opacity: 1, y: 0 }}
        //     transition={{ duration: 0.6 }}
        //     className="p-8 h-full max-w-5xl mx-auto"
        // >
        //     <h1 className="text-4xl font-bold mb-6">Welcome to My AI Portfolio</h1>
        //     <p className="mb-4">This is the Phase 1 static page setup with Tailwind + Shadcn + Framer Motion.</p>
        //     <Button>Get Started</Button>
        // </motion.div>

        <main className="flex flex-1 justify-center">
            <section className="relative w-full max-w-6xl flex items-center justify-center p-6">
                {/* Pulse Background */}
                <PulseBackground />

                {/* Content */}
                <div className="relative z-10 text-center">
                    <p className="text-gray-400 mb-2">Hi — I'm</p>
                    <h1 className="text-6xl font-bold mb-2">HAMEED HUSSAIN</h1>
                    <p className="text-xl mb-4">Full-Stack Software Engineer</p>
                    <p className="text-gray-300 max-w-xl leading-relaxed">
                        I'm a full-stack engineer who enjoys building clean, scalable web
                        products that solve real problems with elegant solutions.
                    </p>
                </div>
            </section>
        </main>

    );
}
