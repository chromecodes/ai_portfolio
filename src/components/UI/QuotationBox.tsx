import React from 'react'

interface QuotationBoxProps {
    quote: string;
}

export default function QuotationBox({ quote }: QuotationBoxProps) {
    return (
        <blockquote className="p-6 border-l-4 border-blue-600 bg-blue-50/30 dark:bg-gray-800/30 rounded-r-lg">
            <p className="text-lg italic text-gray-700 dark:text-gray-300">"{quote}"</p>
        </blockquote>
    );
}