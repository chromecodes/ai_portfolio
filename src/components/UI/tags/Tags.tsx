import React from 'react'

export default function Tags({
    tag,
    index,
    theme = "accent",


}: {
    tag: string;
    index: number;
    className?: string;
    theme: "accent" | "light" | "dark";
}) {
    return (
        <span
            key={tag}
            className={`px-3 py-1.5 
                text-xs font-semibold 
                rounded-full transition-all text-accent-color duration-300 hover:scale-105 ${theme === "accent"
                    ? "bg-accent-color/10 border-accent-color"
                    : theme === "light"
                        ? "bg-primary-background/10 border-primary-background"
                        : theme === "dark"
                            ? "bg-dark-background/10 border-dark-background"
                            : ""
                }`}
        >
            {tag}
        </span>
    )
}