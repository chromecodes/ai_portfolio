"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArrowButtonProps {
    direction: "left" | "right";
    onClick: () => void;
    disabled?: boolean;
}

export default function ArrowButton({
    direction,
    onClick,
    disabled = false,
}: ArrowButtonProps) {
    const Icon =
        direction === "left"
            ? ChevronLeft
            : ChevronRight;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={
                direction === "left"
                    ? "Previous image"
                    : "Next image"
            }
            className=" flex 
                h-8
                 w-8 
                 items-center 
                 justify-center 
                 rounded-full 
                 bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-40 ">
            <Icon size={20} />
        </button>
    );
}