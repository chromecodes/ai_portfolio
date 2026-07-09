import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageViewerItem } from "./types";

interface ImageSlideProps {
    image: ImageViewerItem;

    isFullLoaded: boolean;

    curvedEdge?: boolean;

}

export default function ImageSlide({ image, isFullLoaded, curvedEdge }: ImageSlideProps) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [image.id]);

    if (hasError) {
        return (
            <div className={"aspect-video w-full flex items-center justify-center text-neutral-400" + (curvedEdge ? " rounded-2xl" : "")}>
                <div className="text-center">
                    <p className="text-4xl">🖼️</p>

                    <p>Image unavailable</p>

                    <p className="text-sm">{image.alt}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full">
            <Image
                src={isFullLoaded ? image.src : image.blurSrc}
                alt={image.alt}
                fill
                onError={() => {
                    setHasError(true);
                }}
                style={{ objectFit: image.displayMode }}
                className={` object-cover  transition-all duration-500 ${isFullLoaded ? "blur-0 scale-100" : "blur-sm scale-105"} ${curvedEdge ? "rounded-2xl" : ""}`}
            />
        </div>
    );
}
