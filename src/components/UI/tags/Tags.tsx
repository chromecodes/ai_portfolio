import React from 'react'

export default function Tags({
    tag,
    index,

}: {
    tag: string;
    index: number;
    className?: string;
}) {
    return (
        <span
            key={tag}
            className="px-3 
                       py-1.5 
                       text-xs 
                       font-semibold 
                       rounded-full 
                       bg-career-badge 
                       text-primary-foreground 
                       border 
                       border-career-badge-border 
                       transition-all 
                       duration-300 
                       hover:scale-105"
        >
            {tag}
        </span>
    )
}