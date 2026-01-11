"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import EnergyOverlay from "./transitions/EnergyOverlay";
type TransitionContextType = {
    startTransition: (to: string) => void;
};

const TransitionContext = createContext<TransitionContextType | null>(null);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [active, setActive] = useState(false);
    const [nextRoute, setNextRoute] = useState<string | null>(null);

    const startTransition = (to: string) => {
        setNextRoute(to);
        setActive(true);
    };

    const onMidpoint = () => {
        if (nextRoute) router.push(nextRoute);
    };

    const onFinish = () => {
        setActive(false);
        setNextRoute(null);
    };

    return (
        <TransitionContext.Provider value={{ startTransition }}>
            {children}
            {active && (
                <EnergyOverlay
                    onMidpoint={onMidpoint}
                    onFinish={onFinish}
                />
            )}
        </TransitionContext.Provider>
    );
}

export const useTransition = () => {
    const ctx = useContext(TransitionContext);
    if (!ctx) throw new Error("useTransition must be used inside TransitionProvider");
    return ctx;
};
