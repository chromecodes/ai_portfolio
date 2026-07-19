import React from 'react'

interface QuotationBoxProps {
    quote: string;
}

export default function QuotationBox({ quote }: QuotationBoxProps) {
    return (
        <blockquote className="p-6 border-l-4 border-career-accent bg-career-card-muted rounded-r-lg">
            <p className="text-lg italic text-career-fg-muted">"{quote}"</p>
        </blockquote>
    );
}