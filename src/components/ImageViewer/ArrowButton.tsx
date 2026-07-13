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
            className="image-viewer-icon disabled:opacity-25 disabled:pointer-events-none">     <Icon size={20} />
        </button >
    );
}