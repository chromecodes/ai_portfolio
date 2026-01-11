"use client";

import { useTransition } from "./PageTransitionProvider";


export default function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    const { startTransition } = useTransition();

    return (
        <button onClick={() => startTransition(href)}>
            {children}
        </button>
    );
}
